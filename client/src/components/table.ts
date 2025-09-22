import { type ComponentProps } from '../types/component';

type TableProps = ComponentProps & {};
type TableCellProps = TableProps & {
	content?: string;
};

export function Table({ classes = [] }: TableProps) {
	const table = document.createElement('table');
	table.classList.add('w-full', 'text-left', 'text-sm', ...classes);

	return table;
}

export function TableHeader({ classes = [] }: TableProps) {
	const thead = document.createElement('thead');
	thead.classList.add('uppercase', ...classes);

	return thead;
}

export function TableBody({ classes = [] }: TableProps) {
	const tbody = document.createElement('tbody');
	tbody.classList.add('divide-y', 'divide-accent', ...classes);

	return tbody;
}

export function TableRow({ classes = [] }: TableProps) {
	const tr = document.createElement('tr');
	tr.classList.add(...classes);

	return tr;
}

export function TableHeaderCell({ classes = [], content }: TableCellProps) {
	const th = document.createElement('th');
	th.textContent = content || null;
	th.classList.add('py-2', ...classes);

	return th;
}

export function TableCell({ classes = [], content }: TableCellProps) {
	const td = document.createElement('td');
	td.textContent = content || null;
	td.classList.add('py-1', 'whitespace-nowrap', ...classes);

	return td;
}
