/**
 * restricted-dynamic-imports — áp ĐÚNG bảng luật của `no-restricted-imports` cho `import('…')` động.
 *
 * `no-restricted-imports` chỉ đọc import TĨNH và `export … from`: `import('@/features/auth')` ở tầng `core` đi vòng qua cả luật tầng
 * lẫn luật public API. Rule này nhận CÙNG đối tượng tuỳ chọn (`{ paths, patterns }`) nên không có bảng luật thứ hai để giữ khớp.
 *
 * Phạm vi: chỉ nguồn là chuỗi hằng (`'…'` hoặc template không biến). `paths[].importNames` bỏ qua — import động không cho biết tên
 * nào được dùng. `patterns[]` chỉ hiểu khoá `regex` (bảng của repo không dùng `group`).
 */
const staticSource = (node) => {
  const { source } = node;
  if (source.type === 'Literal' && typeof source.value === 'string') return source.value;
  if (source.type === 'TemplateLiteral' && source.expressions.length === 0) {
    return source.quasis[0].value.cooked;
  }
  return undefined;
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Import động không đi vòng qua luật tầng và public API của `no-restricted-imports`.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          paths: { type: 'array' },
          patterns: { type: 'array' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      restricted: '`import()` động tới `{{source}}` bị chặn. {{message}}',
    },
  },
  create(context) {
    const { paths = [], patterns = [] } = context.options[0] ?? {};
    const bannedPaths = paths.filter((item) => typeof item === 'object' && !item.importNames);
    const regexPatterns = patterns
      .filter((item) => typeof item === 'object' && typeof item.regex === 'string')
      .map((item) => ({
        test: new RegExp(item.regex, item.caseSensitive === false ? 'i' : undefined),
        message: item.message ?? '',
      }));

    return {
      ImportExpression(node) {
        const source = staticSource(node);
        if (source === undefined) return;
        const hit =
          bannedPaths.find((item) => item.name === source) ??
          regexPatterns.find((item) => item.test.test(source));
        if (!hit) return;
        context.report({
          node: node.source,
          messageId: 'restricted',
          data: { source, message: hit.message ?? '' },
        });
      },
    };
  },
};
