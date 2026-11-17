/**
 * Đọc KHỐI TÀI LIỆU của component bằng TypeScript compiler API — lõi chung của
 * `tests/policy/foundations/ui-kit-docs.test.ts` và `docs-blocks.test.ts`.
 *
 * Dùng compiler thay regex để đọc KIỂU props thật (kế thừa, `Omit`, union, generic): `@param
 * props.<tên>` phải khớp ĐÚNG tập prop mà component nhận, không thiếu, không thừa.
 * Luật: `docs/rules/foundations/comment-policy.md §1` · `docs/rules/structure/component-structure.md §4`.
 */

import ts from 'typescript';

/** Thư mục gốc repo (vitest chạy ở đây), dấu `/`. */
export const REPO_ROOT = ts.sys.getCurrentDirectory().replace(/\\/g, '/');

export interface DocTarget {
  /** Tên component cần có khối tài liệu. */
  name: string;
  /** Đường dẫn tính từ gốc repo, vd `src/shared/ui/actions/Button.tsx`. */
  file: string;
}

export interface DocRules {
  /** Dòng đầu khối là `Tên — mô tả` và có `@example` (component công khai của `shared/**`). */
  summaryAndExample: boolean;
}

/** Chương trình TS dựng một lần cho cả lô file — dựng lại cho từng file chậm hàng chục lần. */
export function createDocProgram(files: string[]) {
  const parsed = ts.getParsedCommandLineOfConfigFile(
    `${REPO_ROOT}/tsconfig.app.json`,
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
  );
  if (!parsed) throw new Error('Không đọc được tsconfig.app.json');
  const program = ts.createProgram(
    files.map((file) => `${REPO_ROOT}/${file}`),
    parsed.options,
  );
  const checker = program.getTypeChecker();
  return {
    problemsOf: (target: DocTarget, rules: DocRules) => problemsOf(target, rules, program, checker),
  };
}

/** Tên mà file `export default` (`export default X;` · `export default function X` · `… class X`). */
function defaultExportName(sf: ts.SourceFile): string | undefined {
  for (const st of sf.statements) {
    if (ts.isExportAssignment(st) && !st.isExportEquals) {
      return ts.isIdentifier(st.expression) ? st.expression.text : undefined;
    }
    if (
      (ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) &&
      st.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
    ) {
      return st.name?.text;
    }
  }
  return undefined;
}

type Declaration = {
  statement: ts.Statement;
  node: ts.FunctionDeclaration | ts.ClassDeclaration | ts.VariableDeclaration;
};

function findDeclaration(sf: ts.SourceFile, name: string): Declaration | undefined {
  for (const st of sf.statements) {
    if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && st.name?.text === name) {
      return { statement: st, node: st };
    }
    if (ts.isVariableStatement(st)) {
      const decl = st.declarationList.declarations.find(
        (d) => ts.isIdentifier(d.name) && d.name.text === name,
      );
      if (decl) return { statement: st, node: decl };
    }
  }
  return undefined;
}

/** Khối `/** … *\/` sát ngay trên câu lệnh (không có dòng trống ở giữa). */
function attachedDoc(sf: ts.SourceFile, statement: ts.Statement): string | undefined {
  const ranges = ts.getLeadingCommentRanges(sf.text, statement.pos) ?? [];
  const last = ranges.at(-1);
  if (!last || !sf.text.startsWith('/**', last.pos)) return undefined;
  const gap = sf.text.slice(last.end, statement.getStart(sf));
  if ((gap.match(/\n/g) ?? []).length > 1) return undefined;
  return sf.text.slice(last.pos, last.end);
}

/** Các khối JSDoc đứng riêng (dòng trống phía sau) — kiểu "khối hướng dẫn đầu file" cũ. */
function detachedDocLines(sf: ts.SourceFile): number[] {
  const lines: number[] = [];
  for (const m of sf.text.matchAll(/\/\*\*[\s\S]*?\*\//g)) {
    const after = sf.text.slice(m.index + m[0].length);
    if (/^[ \t]*\r?\n[ \t]*\r?\n/.test(after)) {
      lines.push(sf.getLineAndCharacterOfPosition(m.index).line + 1);
    }
  }
  return lines;
}

const unwrap = (expr: ts.Expression): ts.Expression => {
  let e = expr;
  while (ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isParenthesizedExpression(e)) {
    e = e.expression;
  }
  return e;
};

/**
 * Kiểu props của component: tham số đầu của hàm (xuyên qua `memo(...)` / `forwardRef<E, P>(...)`),
 * hoặc đối số kiểu đầu của `extends Component<P, S>` với class component.
 */
function propsTypeOf(
  sf: ts.SourceFile,
  decl: Declaration,
  checker: ts.TypeChecker,
): ts.Type | undefined {
  const fromFunction = (fn: ts.SignatureDeclaration) => {
    const param = fn.parameters[0];
    if (!param) return undefined;
    return param.type ? checker.getTypeFromTypeNode(param.type) : checker.getTypeAtLocation(param);
  };

  const fromExpression = (expr: ts.Expression | undefined, depth = 0): ts.Type | undefined => {
    if (!expr || depth > 3) return undefined;
    const e = unwrap(expr);
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return fromFunction(e);
    if (ts.isIdentifier(e)) {
      const inner = findDeclaration(sf, e.text);
      if (!inner) return undefined;
      return fromNode(inner.node, depth + 1);
    }
    if (ts.isCallExpression(e)) {
      const callee = e.expression.getText(sf);
      if (/forwardRef$/.test(callee) && e.typeArguments?.[1]) {
        return checker.getTypeFromTypeNode(e.typeArguments[1]);
      }
      return fromExpression(e.arguments[0], depth + 1);
    }
    return undefined;
  };

  function fromNode(node: Declaration['node'], depth = 0): ts.Type | undefined {
    if (ts.isFunctionDeclaration(node)) return fromFunction(node);
    if (ts.isClassDeclaration(node)) {
      const base = node.heritageClauses?.[0]?.types[0]?.typeArguments?.[0];
      return base && checker.getTypeFromTypeNode(base);
    }
    return fromExpression(node.initializer, depth);
  }

  return fromNode(decl.node);
}

/** Mọi prop có thể có — với union lấy hợp các nhánh (prop chỉ có ở một nhánh vẫn phải ghi). */
function propsOf(type: ts.Type, checker: ts.TypeChecker): ts.Symbol[] {
  const members = type.isUnion() ? type.types : [type];
  const byName = new Map<string, ts.Symbol>();
  for (const member of members) {
    for (const prop of checker.getPropertiesOfType(member)) {
      if (!byName.has(prop.name)) byName.set(prop.name, prop);
    }
  }
  return [...byName.values()];
}

/** Prop do repo tự khai (kể cả kế thừa từ kiểu của repo) — không tính prop của React / Radix. */
const isOwnProp = (symbol: ts.Symbol) =>
  symbol.name !== 'key' &&
  (symbol.declarations ?? []).some(
    (d) => !d.getSourceFile().fileName.replace(/\\/g, '/').includes('/node_modules/'),
  );

const documentedParams = (doc: string) =>
  [...doc.matchAll(/@param\s+props\.([\w$-]+)/g)].map((m) => m[1]);

function problemsOf(
  target: DocTarget,
  rules: DocRules,
  program: ts.Program,
  checker: ts.TypeChecker,
): string[] {
  const where = `${target.file} (${target.name})`;
  const sf = program.getSourceFile(`${REPO_ROOT}/${target.file}`);
  if (!sf) return [`${where} — không tìm thấy file`];
  if (/^export \{ default \} from '/m.test(sf.text)) return [];

  const problems: string[] = [];
  const detached = detachedDocLines(sf);
  if (detached.length > 0) {
    problems.push(
      `${where} — còn khối hướng dẫn đứng riêng (dòng ${detached.join(', ')}): chuyển xuống ngay trên khai báo component`,
    );
  }

  const declared = findDeclaration(sf, target.name) ? target.name : defaultExportName(sf);
  if (!declared) {
    return [
      ...problems,
      `${where} — cần khai báo có tên \`${target.name}\` (\`export default ${target.name};\`)`,
    ];
  }
  const decl = findDeclaration(sf, declared);
  const doc = decl && attachedDoc(sf, decl.statement);
  if (!decl || !doc) {
    return [...problems, `${where} — thiếu khối tài liệu ngay trên khai báo \`${declared}\``];
  }

  if (rules.summaryAndExample) {
    const firstLine = doc.split('\n')[1]?.replace(/^\s*\*\s?/, '') ?? '';
    if (!firstLine.startsWith(`${declared} — `)) {
      problems.push(`${where} — dòng đầu khối tài liệu phải là "${declared} — <mô tả>"`);
    }
    if (!doc.includes('@example')) problems.push(`${where} — thiếu @example`);
  }

  const type = propsTypeOf(sf, decl, checker);
  if (!type) return problems;

  const all = propsOf(type, checker);
  const allNames = new Set(all.map((p) => p.name));
  const documented = new Set(documentedParams(doc));

  const missing = all.filter((p) => isOwnProp(p) && !documented.has(p.name)).map((p) => p.name);
  if (missing.length > 0) {
    problems.push(`${where} — thiếu @param props.${missing.join(', props.')}`);
  }

  const stale = [...documented].filter((name) => !allNames.has(name));
  if (stale.length > 0) {
    problems.push(`${where} — @param không còn trong props: ${stale.join(', ')}`);
  }
  return problems;
}
