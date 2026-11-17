/**
 * Nhóm selects (`Dropdown` · `MultiSelect` · `DropdownTreeSelect`) — hành vi bàn phím, tìm kiếm,
 * chọn / bỏ chọn, uncontrolled, disabled. Picker (ngày, giờ, tháng) ở `pickers.test.tsx`.
 */

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Dropdown, DropdownTreeSelect, MultiSelect } from '@/shared/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const BASIC = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
];

/** Không ô nào bị khoá — cho ca đếm trạng thái tick của từng ô. */
const PLAIN = BASIC.map(({ value, label }) => ({ value, label }));

const q = <T extends Element = HTMLElement>(sel: string) =>
  document.body.querySelector<T>(sel) as T;
const qa = <T extends Element = HTMLElement>(sel: string) =>
  Array.from(document.body.querySelectorAll<T>(sel));
const trigger = () => q('[role="combobox"]');
const openSelect = () => fireEvent.keyDown(trigger(), { key: 'Enter' });
const searchInput = () => q<HTMLInputElement>('input[placeholder]');
const options = () => qa('[role="option"]');
const typeInto = (text: string) => fireEvent.change(searchInput(), { target: { value: text } });
const flush = (ms = 1000) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe('Dropdown — hành vi', () => {
  it('ref chuyển tiếp tới <button> trigger', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Dropdown ref={ref} options={BASIC} />);
    expect(ref.current).toBe(trigger());
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('chọn option bằng bàn phím → onValueChange(value) và đóng panel', () => {
    const fn = vi.fn();
    render(<Dropdown options={BASIC} onValueChange={fn} />);
    openSelect();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(options()[1], { key: 'Enter' });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('option có value rỗng → onValueChange("") (EMPTY_SENTINEL)', () => {
    const fn = vi.fn();
    render(
      <Dropdown
        options={[{ value: '', label: 'Không chọn' }, ...BASIC]}
        value="a"
        onValueChange={fn}
      />,
    );
    openSelect();
    fireEvent.keyDown(options()[0], { key: 'Enter' });
    expect(fn).toHaveBeenCalledWith('');
  });

  it('disabled → không mở được', () => {
    render(<Dropdown disabled options={BASIC} />);
    openSelect();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(options()).toHaveLength(0);
  });

  it('option disabled không chọn được', () => {
    const fn = vi.fn();
    render(<Dropdown options={BASIC} onValueChange={fn} />);
    openSelect();
    fireEvent.keyDown(options()[2], { key: 'Enter' });
    expect(fn).not.toHaveBeenCalled();
  });

  it('đóng → không dựng option; mở → dựng đủ', () => {
    render(<Dropdown options={BASIC} />);
    expect(options()).toHaveLength(0);
    openSelect();
    expect(options()).toHaveLength(3);
  });

  it('clearable: ✕ onClick và onPointerDown đều gọi onValueChange("") và KHÔNG mở panel', () => {
    const fn = vi.fn();
    render(<Dropdown clearable options={BASIC} value="a" onValueChange={fn} />);
    const x = screen.getByLabelText('Xoá lựa chọn');
    fireEvent.pointerDown(x);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith('');
    fireEvent.click(x);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('clearInList: ✕ trên dòng đang chọn → onValueChange("") + đóng panel', () => {
    const fn = vi.fn();
    render(<Dropdown clearInList options={BASIC} value="a" onValueChange={fn} />);
    openSelect();
    expect(qa('[aria-label="Gỡ lựa chọn"]')).toHaveLength(1);
    fireEvent.pointerDown(q('[aria-label="Gỡ lựa chọn"]'));
    expect(fn).toHaveBeenCalledWith('');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('chặn artifact BubbleSelect: đổi value từ ngoài khi đóng KHÔNG gọi onValueChange("")', () => {
    const fn = vi.fn();
    const { rerender } = render(
      <form>
        <Dropdown options={BASIC} value="a" onValueChange={fn} />
      </form>,
    );
    rerender(
      <form>
        <Dropdown options={BASIC} value="b" onValueChange={fn} />
      </form>,
    );
    expect(fn).not.toHaveBeenCalled();
  });

  it('value đổi sang undefined (đã xoá) → hết tick, hiện placeholder, chọn lại được cùng option', () => {
    const fn = vi.fn();
    const { rerender } = render(<Dropdown options={BASIC} value="a" onValueChange={fn} />);
    expect(trigger().textContent).toContain('Alpha');
    rerender(<Dropdown options={BASIC} value={undefined} onValueChange={fn} />);
    expect(trigger().textContent).toContain('Chọn');
    openSelect();
    expect(options().map((o) => o.getAttribute('data-state'))).toEqual([
      'unchecked',
      'unchecked',
      'unchecked',
    ]);
    fireEvent.keyDown(options()[0], { key: 'Enter' });
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('uncontrolled bằng defaultValue: tick đúng option', () => {
    render(<Dropdown defaultValue="b" options={BASIC} />);
    openSelect();
    expect(options().map((o) => o.getAttribute('data-state'))).toEqual([
      'unchecked',
      'checked',
      'unchecked',
    ]);
  });

  it('creatable: gõ giá trị mới → item "Tạo mới" → chọn gọi onValueChange(giá trị)', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(<Dropdown creatable options={BASIC} searchable onValueChange={fn} />);
    openSelect();
    typeInto('Mới');
    flush();
    const created = options().find((o) => o.textContent?.includes('Tạo mới'));
    expect(created?.textContent).toContain('Tạo mới: "Mới"');
    fireEvent.keyDown(created as HTMLElement, { key: 'Enter' });
    expect(fn).toHaveBeenCalledWith('Mới');
  });

  it('lọc: option không khớp vẫn nằm trong DOM nhưng ẩn + disabled; đóng panel xoá từ khoá', () => {
    vi.useFakeTimers();
    render(<Dropdown options={BASIC} searchable />);
    openSelect();
    typeInto('alp');
    flush();
    expect(
      options().map((o) => [o.className.includes('hidden'), o.hasAttribute('data-disabled')]),
    ).toEqual([
      [false, false],
      [true, true],
      [true, true],
    ]);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    openSelect();
    expect(searchInput().value).toBe('');
    flush();
    expect(options().every((o) => !o.className.includes('hidden'))).toBe(true);
  });

  describe('giữ focus ở ô tìm kiếm (docs/rules/interaction/search-matching.md §4)', () => {
    it('không searchable → panel nhận focus được (tabIndex=-1), không có ô tìm kiếm', () => {
      render(<Dropdown options={BASIC} />);
      openSelect();
      expect(q('[role="listbox"]').getAttribute('tabindex')).toBe('-1');
      expect(qa('input[placeholder]')).toHaveLength(0);
    });

    it('searchable → panel KHÔNG có tabIndex', () => {
      render(<Dropdown options={BASIC} searchable />);
      openSelect();
      expect(q('[role="listbox"]').hasAttribute('tabindex')).toBe(false);
    });

    it('focus rơi vào item lần ĐẦU → kéo về ô tìm kiếm; lần sau để yên cho Radix', () => {
      vi.useFakeTimers();
      render(<Dropdown options={BASIC} searchable />);
      openSelect();
      flush(1);
      const [alpha, beta] = options();
      act(() => alpha.focus());
      expect(document.activeElement).toBe(searchInput());
      act(() => alpha.focus());
      expect(document.activeElement).toBe(alpha);
      act(() => beta.focus());
      expect(document.activeElement).toBe(beta);
    });

    it('đóng rồi mở lại → cờ "đã đòi focus" được reset', () => {
      vi.useFakeTimers();
      render(<Dropdown options={BASIC} searchable />);
      openSelect();
      flush(1);
      act(() => options()[0].focus());
      act(() => options()[0].focus());
      expect(document.activeElement).toBe(options()[0]);
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      openSelect();
      flush(1);
      act(() => options()[0].focus());
      expect(document.activeElement).toBe(searchInput());
    });

    it('ArrowDown / ArrowUp trong ô tìm kiếm → nhảy tới option đầu / cuối không bị disabled', () => {
      vi.useFakeTimers();
      render(<Dropdown options={BASIC} searchable />);
      openSelect();
      flush(1);
      const prevented = !fireEvent.keyDown(searchInput(), { key: 'ArrowDown' });
      expect(prevented).toBe(true);
      expect(document.activeElement).toBe(options()[0]);
      act(() => searchInput().focus());
      fireEvent.keyDown(searchInput(), { key: 'ArrowUp' });
      expect(document.activeElement).toBe(options()[1]);
      act(() => options()[0].focus());
      expect(document.activeElement).toBe(options()[0]);
    });

    it('phím khác trong ô tìm kiếm không bị chặn mặc định', () => {
      vi.useFakeTimers();
      render(<Dropdown options={BASIC} searchable />);
      openSelect();
      flush(1);
      expect(fireEvent.keyDown(searchInput(), { key: 'g' })).toBe(true);
    });

    it('con trỏ đang ở item mà gõ ký tự → chảy về ô tìm kiếm (capture) thay vì typeahead', () => {
      vi.useFakeTimers();
      render(<Dropdown options={BASIC} searchable />);
      openSelect();
      flush(1);
      act(() => options()[0].focus());
      act(() => options()[0].focus());
      expect(document.activeElement).toBe(options()[0]);
      const notPrevented = fireEvent.keyDown(options()[0], { key: 'g' });
      expect(notPrevented).toBe(false);
      expect(searchInput().value).toBe('g');
      expect(document.activeElement).toBe(searchInput());
      act(() => options()[0].focus());
      fireEvent.keyDown(options()[0], { key: 'a' });
      expect(searchInput().value).toBe('ga');
      act(() => options()[0].focus());
      fireEvent.keyDown(options()[0], { key: 'Backspace' });
      expect(searchInput().value).toBe('g');
      act(() => options()[0].focus());
      fireEvent.keyDown(options()[0], { key: ' ' });
      expect(searchInput().value).toBe('g ');
      flush();
    });

    it('Ctrl/Alt/Meta, IME đang ghép, phím không phải ký tự → KHÔNG cướp phím', () => {
      vi.useFakeTimers();
      render(<Dropdown options={BASIC} searchable />);
      openSelect();
      flush(1);
      act(() => options()[0].focus());
      act(() => options()[0].focus());
      expect(fireEvent.keyDown(options()[0], { key: 'c', ctrlKey: true })).toBe(true);
      expect(fireEvent.keyDown(options()[0], { key: 'c', altKey: true })).toBe(true);
      expect(fireEvent.keyDown(options()[0], { key: 'c', metaKey: true })).toBe(true);
      expect(fireEvent.keyDown(options()[0], { key: 'g', isComposing: true })).toBe(true);
      expect(fireEvent.keyDown(options()[0], { key: 'Shift' })).toBe(true);
      expect(searchInput().value).toBe('');
    });

    it('không searchable → gõ ký tự không bị chuyển hướng', () => {
      render(<Dropdown options={BASIC} />);
      openSelect();
      expect(fireEvent.keyDown(options()[0], { key: 'g' })).toBe(true);
    });
  });
});

describe('MultiSelect — hành vi', () => {
  const OPTS = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma', disabled: true },
    { value: 'd', label: 'Delta' },
  ];
  const box = (label: string) =>
    qa<HTMLInputElement>('input[type="checkbox"]').find((i) =>
      i.closest('label')?.textContent?.includes(label),
    ) as HTMLInputElement;

  it('ref chuyển tiếp tới <button> trigger', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<MultiSelect ref={ref} options={OPTS} />);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('tick / bỏ tick → onValueChange với mảng mới', () => {
    const fn = vi.fn();
    render(<MultiSelect defaultOpen options={OPTS} value={['a']} onValueChange={fn} />);
    fireEvent.click(box('Beta'));
    expect(fn).toHaveBeenLastCalledWith(['a', 'b']);
    fireEvent.click(box('Alpha'));
    expect(fn).toHaveBeenLastCalledWith([]);
  });

  it('option disabled không tick được', () => {
    const fn = vi.fn();
    render(<MultiSelect defaultOpen options={OPTS} onValueChange={fn} />);
    expect(box('Gamma').disabled).toBe(true);
    expect(box('Alpha').disabled).toBe(false);
    expect(q('label[data-disabled]').textContent).toContain('Gamma');
    expect(fn).not.toHaveBeenCalled();
  });

  it('✕ trên chip gỡ đúng giá trị và KHÔNG mở popover', () => {
    const fn = vi.fn();
    render(<MultiSelect options={OPTS} value={['a', 'b']} onValueChange={fn} />);
    fireEvent.pointerDown(screen.getByLabelText('Bỏ chọn Alpha'));
    fireEvent.click(screen.getByLabelText('Bỏ chọn Alpha'));
    expect(fn).toHaveBeenCalledWith(['b']);
    expect(document.body.querySelector('button')?.getAttribute('aria-expanded')).toBe('false');
  });

  it('clearable: ✕ xoá tất cả → [] và KHÔNG mở popover', () => {
    const fn = vi.fn();
    render(<MultiSelect clearable options={OPTS} value={['a', 'b']} onValueChange={fn} />);
    fireEvent.pointerDown(screen.getByLabelText('Bỏ chọn tất cả'));
    fireEvent.click(screen.getByLabelText('Bỏ chọn tất cả'));
    expect(fn).toHaveBeenCalledWith([]);
    expect(document.body.querySelector('button')?.getAttribute('aria-expanded')).toBe('false');
  });

  it('chọn tất cả: tri-state, chỉ tác động mục không disabled, giữ mục ngoài phạm vi', () => {
    const fn = vi.fn();
    const { rerender } = render(
      <MultiSelect defaultOpen options={OPTS} selectAll value={[]} onValueChange={fn} />,
    );
    const all = () => box('Chọn tất cả');
    expect(all().checked).toBe(false);
    expect(all().indeterminate).toBe(false);
    fireEvent.click(all());
    expect(fn).toHaveBeenLastCalledWith(['a', 'b', 'd']);

    rerender(<MultiSelect defaultOpen options={OPTS} selectAll value={['a']} onValueChange={fn} />);
    expect(all().checked).toBe(false);
    expect(all().indeterminate).toBe(true);
    fireEvent.click(all());
    expect(fn).toHaveBeenLastCalledWith(['a', 'b', 'd']);

    rerender(
      <MultiSelect
        defaultOpen
        options={OPTS}
        selectAll
        value={['a', 'b', 'd', 'x']}
        onValueChange={fn}
      />,
    );
    expect(all().checked).toBe(true);
    expect(all().indeterminate).toBe(false);
    fireEvent.click(all());
    expect(fn).toHaveBeenLastCalledWith(['x']);
    expect(all().closest('label')?.textContent).toContain('Chọn tất cả (3)');
  });

  it('chọn tất cả khi đang lọc chỉ áp lên kết quả lọc', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(
      <MultiSelect
        defaultOpen
        options={OPTS}
        searchable
        selectAll
        value={['a']}
        onValueChange={fn}
      />,
    );
    typeInto('ta');
    flush();
    expect(box('Chọn tất cả').closest('label')?.textContent).toContain('(2)');
    fireEvent.click(box('Chọn tất cả'));
    expect(fn).toHaveBeenLastCalledWith(['a', 'b', 'd']);
  });

  it('lọc không dấu + "Không có kết quả"', () => {
    vi.useFakeTimers();
    render(
      <MultiSelect
        defaultOpen
        options={[{ value: 'n', label: 'Nguyễn Văn Ê' }, ...OPTS]}
        searchable
      />,
    );
    typeInto('nguyen');
    flush();
    expect(qa('input[type="checkbox"]').map((i) => i.closest('label')?.textContent)).toEqual([
      'Nguyễn Văn Ê',
    ]);
    typeInto('zzzz');
    flush();
    expect(q('[role="dialog"]').textContent).toContain('Không có kết quả');
  });

  it('cuộn chuột trong danh sách được xử lý thủ công (wheel non-passive, preventDefault)', () => {
    render(<MultiSelect defaultOpen options={OPTS} />);
    const list = q('[class*="max-h-[min(300px"]');
    expect(fireEvent.wheel(list, { deltaY: 40 })).toBe(false);
  });

  it('maxDisplay → "+N"', () => {
    render(<MultiSelect maxDisplay={1} options={OPTS} value={['a', 'b', 'd']} />);
    expect(document.body.textContent).toContain('+2');
  });

  it('hideChips → luôn hiện placeholder', () => {
    render(<MultiSelect hideChips options={OPTS} placeholder="PH" value={['a']} />);
    expect(document.body.textContent).toContain('PH');
    expect(document.body.textContent).not.toContain('Alpha');
  });

  it('controlled open + onOpenChange: bấm trigger gọi onOpenChange nhưng giữ nguyên open', () => {
    const fn = vi.fn();
    render(<MultiSelect open={false} options={OPTS} onOpenChange={fn} />);
    fireEvent.click(document.body.querySelector('button') as HTMLElement);
    expect(fn).toHaveBeenCalledWith(true);
    expect(qa('input[type="checkbox"]')).toHaveLength(0);
  });

  it('disabled → trigger disabled', () => {
    render(<MultiSelect disabled options={OPTS} />);
    expect((document.body.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('DropdownTreeSelect — hành vi', () => {
  const DATA = [
    {
      id: 'r1',
      name: 'Gốc 1',
      children: [
        { id: 'c1', name: 'Con 1' },
        { id: 'c2', name: 'Con 2', disabled: true },
        {
          id: 'c3',
          name: 'Con 3',
          children: [
            { id: 'g1', name: 'Cháu 1' },
            { id: 'g2', name: 'Cháu 2' },
          ],
        },
      ],
    },
    { id: 'r2', name: 'Gốc 2' },
    { id: 'r3', name: 'Gốc 3', disabled: true },
  ];
  const triggerBtn = () => document.body.querySelector('button') as HTMLButtonElement;
  const openTree = () => fireEvent.click(triggerBtn());
  const nameSpan = (name: string) =>
    qa('[role="treeitem"] span').find(
      (s) => s.textContent === name && s.className.includes('text-ellipsis'),
    ) as HTMLElement;
  const rowWrap = (name: string) =>
    qa('[role="treeitem"] span.cursor-pointer').find((s) => s.textContent === name) as HTMLElement;
  const treeCheckbox = (name: string) =>
    qa<HTMLInputElement>('input[type="checkbox"]').find(
      (i) => i.closest('[role="treeitem"]')?.textContent === name,
    ) as HTMLInputElement;

  it('single: bấm tên → onChange([id]) và đóng; bấm lại cái đang chọn vẫn bắn onChange', () => {
    const fn = vi.fn();
    render(<DropdownTreeSelect data={DATA} openByDefault value={['r2']} onChange={fn} />);
    openTree();
    fireEvent.click(rowWrap('Gốc 2'));
    expect(fn).toHaveBeenCalledWith(['r2']);
    expect(triggerBtn().getAttribute('aria-expanded')).toBe('false');
    openTree();
    fireEvent.click(rowWrap('Con 1'));
    expect(fn).toHaveBeenLastCalledWith(['c1']);
  });

  it('single: node disabled không chọn được', () => {
    const fn = vi.fn();
    render(<DropdownTreeSelect data={DATA} onChange={fn} />);
    openTree();
    fireEvent.click(rowWrap('Gốc 3'));
    expect(fn).not.toHaveBeenCalled();
    expect(triggerBtn().getAttribute('aria-expanded')).toBe('true');
  });

  it('controlled: value cố định thì hiển thị không đổi dù onChange gọi', () => {
    const fn = vi.fn();
    render(<DropdownTreeSelect data={DATA} value={['r2']} onChange={fn} />);
    openTree();
    fireEvent.click(rowWrap('Gốc 1'));
    expect(fn).toHaveBeenCalledWith(['r1']);
    expect(triggerBtn().textContent).toContain('Gốc 2');
  });

  it('uncontrolled: defaultValue rồi chọn mới thì hiển thị đổi theo', () => {
    render(<DropdownTreeSelect data={DATA} defaultValue={['r2']} />);
    expect(triggerBtn().textContent).toContain('Gốc 2');
    openTree();
    fireEvent.click(rowWrap('Gốc 1'));
    expect(triggerBtn().textContent).toContain('Gốc 1');
  });

  it('multi: tick checkbox / bấm nhãn → onChange', () => {
    const fn = vi.fn();
    render(
      <DropdownTreeSelect data={DATA} mode="multi" openByDefault value={['c1']} onChange={fn} />,
    );
    openTree();
    fireEvent.click(treeCheckbox('Con 3'));
    expect([...fn.mock.lastCall![0]].sort()).toEqual(['c1', 'c3']);
    fireEvent.click(nameSpan('Con 1'));
    expect(fn).toHaveBeenLastCalledWith([]);
  });

  it('multi: node disabled → checkbox disabled, nhãn không bấm được', () => {
    const fn = vi.fn();
    render(<DropdownTreeSelect data={DATA} mode="multi" openByDefault onChange={fn} />);
    openTree();
    expect(treeCheckbox('Con 2').disabled).toBe(true);
    fireEvent.click(nameSpan('Con 2'));
    expect(fn).not.toHaveBeenCalled();
  });

  it('multi + cascade: chọn cha kéo theo con, trạng thái tri-state ở cha', () => {
    const fn = vi.fn();
    const { rerender } = render(
      <DropdownTreeSelect
        cascade
        data={DATA}
        mode="multi"
        openByDefault
        value={[]}
        onChange={fn}
      />,
    );
    openTree();
    fireEvent.click(treeCheckbox('Con 3'));
    expect([...fn.mock.lastCall![0]].sort()).toEqual(['c3', 'g1', 'g2']);
    rerender(
      <DropdownTreeSelect
        cascade
        data={DATA}
        mode="multi"
        openByDefault
        value={['g1']}
        onChange={fn}
      />,
    );
    expect(treeCheckbox('Con 3').checked).toBe(false);
    expect(treeCheckbox('Con 3').indeterminate).toBe(true);
    rerender(
      <DropdownTreeSelect
        cascade
        data={DATA}
        mode="multi"
        openByDefault
        value={['g1', 'g2']}
        onChange={fn}
      />,
    );
    fireEvent.click(treeCheckbox('Cháu 1'));
    expect(fn).toHaveBeenLastCalledWith(['g2']);
  });

  it('✕ chip → gỡ đúng id và không mở popover; ✕ xoá tất cả → []', () => {
    const fn = vi.fn();
    render(<DropdownTreeSelect data={DATA} mode="multi" value={['c1', 'r2']} onChange={fn} />);
    fireEvent.pointerDown(screen.getByLabelText('Bỏ chọn Con 1'));
    fireEvent.click(screen.getByLabelText('Bỏ chọn Con 1'));
    expect(fn).toHaveBeenLastCalledWith(['r2']);
    fireEvent.click(screen.getByLabelText('Xoá lựa chọn'));
    expect(fn).toHaveBeenLastCalledWith([]);
    expect(triggerBtn().getAttribute('aria-expanded')).toBe('false');
  });

  it('maxDisplay → "+N"', () => {
    render(
      <DropdownTreeSelect data={DATA} maxDisplay={1} mode="multi" value={['c1', 'r2', 'g1']} />,
    );
    expect(triggerBtn().textContent).toContain('+2');
  });

  it('nút Mở rộng / Thu gọn tất cả điều khiển Tree', () => {
    render(<DropdownTreeSelect data={DATA} />);
    openTree();
    expect(qa('[role="treeitem"]')).toHaveLength(3);
    fireEvent.click(screen.getByLabelText('Mở rộng tất cả'));
    expect(qa('[role="treeitem"]')).toHaveLength(8);
    fireEvent.click(screen.getByLabelText('Thu gọn tất cả'));
    expect(qa('[role="treeitem"]')).toHaveLength(3);
  });

  it('tìm kiếm: lọc sau debounce, không dấu', () => {
    vi.useFakeTimers();
    render(<DropdownTreeSelect data={DATA} />);
    openTree();
    fireEvent.change(q<HTMLInputElement>('input[placeholder]'), { target: { value: 'chau' } });
    expect(qa('[role="treeitem"]')).toHaveLength(3);
    flush();
    expect(qa('[role="treeitem"]').length).toBeGreaterThan(0);
    expect(qa('[role="treeitem"]').length).toBeLessThan(8);
  });

  it('searchable=false → không có ô tìm kiếm', () => {
    render(<DropdownTreeSelect data={DATA} searchable={false} />);
    openTree();
    expect(qa('input[placeholder]')).toHaveLength(0);
  });

  it('disabled → không mở', () => {
    render(<DropdownTreeSelect data={DATA} disabled />);
    openTree();
    expect(triggerBtn().getAttribute('aria-expanded')).toBe('false');
  });
});

describe('Dropdown — uncontrolled (defaultValue)', () => {
  const states = () => qa('[role="option"]').map((o) => o.getAttribute('data-state'));

  it('nhãn trigger lấy từ defaultValue và đổi theo lựa chọn mới', () => {
    const fn = vi.fn();
    render(<Dropdown defaultValue="b" options={PLAIN} onValueChange={fn} />);
    expect(trigger().textContent).toContain('Beta');

    openSelect();
    fireEvent.keyDown(qa('[role="option"]')[0], { key: 'Enter' });
    expect(fn).toHaveBeenCalledWith('a');
    expect(trigger().textContent).toContain('Alpha');

    openSelect();
    expect(states()).toEqual(['checked', 'unchecked', 'unchecked']);
  });

  it('clearable: ✕ hiện theo giá trị nội bộ, bấm thì về placeholder và hết tick', () => {
    const fn = vi.fn();
    render(<Dropdown clearable defaultValue="b" options={PLAIN} onValueChange={fn} />);
    fireEvent.pointerDown(screen.getByLabelText('Xoá lựa chọn'));
    expect(fn).toHaveBeenCalledWith('');
    expect(trigger().textContent).toContain('Chọn');
    expect(screen.queryByLabelText('Xoá lựa chọn')).toBeNull();

    openSelect();
    expect(states()).toEqual(['unchecked', 'unchecked', 'unchecked']);
  });
});

describe('MultiSelect — disabled', () => {
  it('ẩn ✕ xoá tất cả và ✕ trên từng chip', () => {
    render(<MultiSelect clearable disabled options={PLAIN} value={['a', 'b']} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByLabelText('Bỏ chọn tất cả')).toBeNull();
    expect(screen.queryByLabelText('Bỏ chọn Alpha')).toBeNull();
  });

  it('không disabled thì ✕ vẫn còn', () => {
    render(<MultiSelect clearable options={PLAIN} value={['a']} />);
    expect(screen.getByLabelText('Bỏ chọn tất cả')).toBeInTheDocument();
    expect(screen.getByLabelText('Bỏ chọn Alpha')).toBeInTheDocument();
  });
});

describe('DropdownTreeSelect — renderTrailing + disabled', () => {
  const DATA = [
    { id: 'r1', name: 'Gốc 1', children: [{ id: 'c1', name: 'Con 1' }] },
    { id: 'r2', name: 'Gốc 2' },
  ];
  const openTree = () => fireEvent.click(document.body.querySelector('button') as HTMLElement);
  const trailing = (node: { id: string }) => `#${node.id}`;

  it('single: nội dung renderTrailing hiện ở cuối mỗi dòng', () => {
    render(<DropdownTreeSelect data={DATA} renderTrailing={trailing} />);
    openTree();
    expect(screen.getByText('#r1')).toBeInTheDocument();
    expect(screen.getByText('#r2')).toBeInTheDocument();
  });

  it('multi: nội dung renderTrailing hiện cạnh nhãn', () => {
    render(<DropdownTreeSelect data={DATA} mode="multi" renderTrailing={trailing} />);
    openTree();
    expect(screen.getByText('#r2').closest('[role="treeitem"]')?.textContent).toContain('Gốc 2');
  });

  it('disabled: ẩn ✕ chip và ✕ xoá lựa chọn', () => {
    render(<DropdownTreeSelect data={DATA} disabled mode="multi" value={['c1', 'r2']} />);
    expect(screen.getByText('Con 1')).toBeInTheDocument();
    expect(screen.queryByLabelText('Bỏ chọn Con 1')).toBeNull();
    expect(screen.queryByLabelText('Xoá lựa chọn')).toBeNull();
  });
});
