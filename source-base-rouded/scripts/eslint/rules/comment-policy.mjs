/**
 * comment-policy — mặc định KHÔNG comment; chỉ giữ comment hướng dẫn sử dụng.
 * Luật đầy đủ: docs/rules/foundations/comment-policy.md.
 *
 * Được phép:
 *  - chỉ thị công cụ (eslint-disable, @ts-expect-error, @vite-ignore, font-guard-quote…);
 *  - khối tài liệu sát khai báo component / hook (`Button`, `useUpload`), ≤ `componentDocMaxLines`;
 *  - MỘT khối hướng dẫn đầu file (JSDoc đứng riêng, có dòng trống phía sau), ≤ `headerMaxLines`;
 *  - JSDoc sát khai báo khác (không dòng trống ở giữa), ≤ `jsdocMaxLines`.
 * Mọi `//`, `{/* *\/}`, comment khối thường và khối thừa đều bị báo.
 */
const DIRECTIVE =
  /^(eslint-(disable|enable)|@ts-(expect-error|ignore|nocheck|check)|prettier-ignore|istanbul |c8 |v8 |@vite-ignore|#__PURE__|webpackChunkName|@jsx|\/\s*<reference)/;

/** Tên component (PascalCase, không phải HẰNG_SỐ) hoặc hook (`useXxx`). */
const DOC_TARGET = /^([A-Z](?![A-Z0-9_]*$)|use[A-Z])/;

const isDirective = (comment) =>
  DIRECTIVE.test(comment.value.trim()) || comment.value.includes('font-guard-quote');

/** `catch {}` / hàm rỗng: ESLint (`no-empty`) bắt buộc có comment bên trong nên đây là chỉ thị công cụ. */
const isInsideEmptyBlock = (source, comment) => {
  const node = source.getNodeByRangeIndex(comment.range[0]);
  return node?.type === 'BlockStatement' && node.body.length === 0;
};

/** Tên được khai báo bởi câu lệnh bắt đầu tại `token` (bỏ qua `export` / `export default`). */
const declaredNameAt = (source, token) => {
  let node = source.getNodeByRangeIndex(token.range[0]);
  if (node?.type === 'ExportNamedDeclaration' || node?.type === 'ExportDefaultDeclaration') {
    node = node.declaration;
  }
  if (node?.type === 'FunctionDeclaration' || node?.type === 'ClassDeclaration')
    return node.id?.name;
  if (node?.type === 'VariableDeclaration') return node.declarations[0]?.id?.name;
  return undefined;
};

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Chỉ cho phép comment hướng dẫn sử dụng (docs/rules/foundations/comment-policy.md).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          headerMaxLines: { type: 'integer', minimum: 1 },
          jsdocMaxLines: { type: 'integer', minimum: 1 },
          componentDocMaxLines: { type: 'integer', minimum: 1 },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      line: 'Comment `//` không được phép — để code tự nói; bẫy ảnh hưởng cách dùng đưa vào dòng `Lưu ý:` của khối tài liệu component, lý do thiết kế đưa vào docs (docs/rules/foundations/comment-policy.md).',
      block:
        'Comment khối thường không được phép — chỉ giữ JSDoc hướng dẫn sử dụng (docs/rules/foundations/comment-policy.md).',
      secondHeader:
        'Chỉ được MỘT khối hướng dẫn đứng riêng mỗi file; JSDoc khác phải sát khai báo (docs/rules/foundations/comment-policy.md).',
      tooLong:
        'JSDoc dài {{lines}} dòng, tối đa {{max}} ({{kind}}) — rút gọn hoặc chuyển lý do vào docs (docs/rules/foundations/comment-policy.md).',
    },
  },
  create(context) {
    const {
      headerMaxLines = 14,
      jsdocMaxLines = 5,
      componentDocMaxLines = 100,
    } = context.options[0] ?? {};
    const source = context.sourceCode;

    const checkLength = (comment, lines, max, kind) => {
      if (lines > max) {
        context.report({ loc: comment.loc, messageId: 'tooLong', data: { lines, max, kind } });
      }
    };

    return {
      Program() {
        let headerSeen = false;
        for (const comment of source.getAllComments()) {
          if (isDirective(comment) || isInsideEmptyBlock(source, comment)) continue;

          if (comment.type === 'Line') {
            context.report({ loc: comment.loc, messageId: 'line' });
            continue;
          }
          if (!comment.value.startsWith('*')) {
            context.report({ loc: comment.loc, messageId: 'block' });
            continue;
          }

          const lines = comment.loc.end.line - comment.loc.start.line + 1;
          const next = source.getTokenAfter(comment, { includeComments: true });
          const attached = Boolean(next) && next.loc.start.line === comment.loc.end.line + 1;

          if (attached) {
            const name =
              next.type === 'Block' || next.type === 'Line'
                ? undefined
                : declaredNameAt(source, next);
            if (name && DOC_TARGET.test(name)) {
              checkLength(comment, lines, componentDocMaxLines, 'khối tài liệu component / hook');
            } else {
              checkLength(comment, lines, jsdocMaxLines, 'JSDoc sát khai báo');
            }
            continue;
          }
          if (headerSeen) {
            context.report({ loc: comment.loc, messageId: 'secondHeader' });
            continue;
          }
          headerSeen = true;
          checkLength(comment, lines, headerMaxLines, 'khối hướng dẫn đầu file');
        }
      },
    };
  },
};
