interface IXY {
	x: number;
	y: number;
}

interface IXYZ extends IXY {
	z: number;
}

interface IUI3DTextLabel {
	identifier: string;
	text: string;
	position: IXYZ;
	element: HTMLDivElement;
}

const labels: IUI3DTextLabel[] = [];

window.mp.events.add('UI3DTextLabel:add', (payload: any) => {
	const { identifier, text, position }: IUI3DTextLabel = JSON.parse(payload);

	// in case if we already have this label
	if (labels.some((label) => label.identifier === identifier)) return;

	const container = document.getElementById('container');
	const element = document.createElement('div');
	element.innerHTML = text;
	element.classList.add('label');
	container.appendChild(element);

	// add the label to the cache
	labels.push({ identifier, text, position, element });
});

window.mp.events.add('UI3DTextLabel:remove', (identifier: string) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;

	labels[index].element?.remove?.();

	labels.splice(index, 1);
});

window.mp.events.add('UI3DTextLabel:update', (identifier: string, option: keyof Omit<IUI3DTextLabel, 'identifier' | 'element'>, value: any) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;

	labels[index][option] = value;

	switch (option) {
		case 'position':
			const { x, y } = JSON.parse(value);
			labels[index].element.style.left = `${x}px`;
			labels[index].element.style.top = `${y}px`;
			break;
		case 'text':
			labels[index].element.innerHTML = value;
			break;
	}
});
