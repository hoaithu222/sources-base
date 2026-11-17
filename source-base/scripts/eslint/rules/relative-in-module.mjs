import path from 'node:path';

/**
 * relative-in-module — import TƯƠNG ĐỐI chỉ đi trong module của file; ra ngoài module thì dùng alias `@/…`.
 *
 * Luật tầng và public API (`no-restricted-imports`) đọc ĐƯỜNG IMPORT: `../../../core/http/api-client` đi vòng
 * qua được cả hai, và regex `(\.\./)+tên` không biết file đang sâu mấy cấp nên báo nhầm khi thư mục con trùng
 * tên (`form/layout` với nhóm `layout`). Rule này giải đường tương đối thành đường thật rồi so với gốc module.
 *
 * Tuỳ chọn:
 *   modules  regex (trên đường tính từ gốc repo, dấu `/`) khớp GỐC module ở đầu đường file — mẫu đầu tiên khớp thắng
 *   allow    `{ from, to }` — file khớp `from` được import tương đối tới đường khớp `to` (vd demo → demo/shared)
 */
const toPosix = (file) => file.split(path.sep).join('/');

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Import tương đối không leo ra khỏi module — ra ngoài dùng alias `@/…` (docs/rules/foundations/folder-structure.md).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          modules: { type: 'array', items: { type: 'string' } },
          allow: {
            type: 'array',
            items: {
              type: 'object',
              properties: { from: { type: 'string' }, to: { type: 'string' } },
              required: ['from', 'to'],
              additionalProperties: false,
            },
          },
        },
        required: ['modules'],
        additionalProperties: false,
      },
    ],
    messages: {
      escape:
        'Import tương đối `{{source}}` ra khỏi module `{{root}}` — ra ngoài module dùng alias `@/…` để luật tầng và public API kiểm được (docs/rules/foundations/folder-structure.md).',
    },
  },
  create(context) {
    const { modules, allow = [] } = context.options[0];
    const file = toPosix(path.relative(context.cwd, context.physicalFilename));
    const root = modules.map((pattern) => file.match(new RegExp(pattern))?.[0]).find(Boolean);
    if (!root) return {};

    const allowed = allow
      .filter(({ from }) => new RegExp(from).test(file))
      .map(({ to }) => new RegExp(to));

    const check = (node) => {
      const source = node.source?.value;
      if (typeof source !== 'string' || !source.startsWith('.')) return;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), source));
      if (`${target}/`.startsWith(`${root}/`) || allowed.some((to) => to.test(target))) return;
      context.report({ node: node.source, messageId: 'escape', data: { source, root } });
    };

    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
      ImportExpression: check,
    };
  },
};
