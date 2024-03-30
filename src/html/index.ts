interface IXY {
	x: number;
	y: number;
}

interface IXYZ extends IXY {
	z: number;
}

interface IUI3DTextLabel {
	identifier: string;
	htmlContent: string;
	position: IXYZ;
	element: HTMLDivElement;
}

const labels: IUI3DTextLabel[] = [];

window.mp.events.add('UI3DTextLabel:add', (payload: any) => {
	const { identifier, htmlContent, position }: IUI3DTextLabel = JSON.parse(payload);

	// in case if we already have this label
	if (labels.some((label) => label.identifier === identifier)) return;

	const container = document.getElementById('container');
	const element = document.createElement('div');
	element.innerHTML = htmlContent;
	element.classList.add('label');
	container?.appendChild(element);

	// add the label to the cache
	labels.push({ identifier, htmlContent, position, element });
});

window.mp.events.add('UI3DTextLabel:remove', (identifier: string) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;

	labels[index].element?.remove?.();

	labels.splice(index, 1);
});

window.mp.events.add('UI3DTextLabel:updateMore', <T extends keyof Omit<IUI3DTextLabel, 'identifier' | 'element'>>(payload: string) => {
	const arrayOfLabels: { identifier: string; parts: [T, IUI3DTextLabel[T]][] }[] = JSON.parse(payload);

	arrayOfLabels
		.map((m) => ({ ...m, index: labels.findIndex((f) => f.identifier === m.identifier) }))
		.filter((f) => f.index !== -1)
		.forEach(({ parts: partsToBeUpdated, index }) => {
			partsToBeUpdated.forEach(([option, value]) => {
				switch (true) {
					case option === 'position' && typeof value === 'object':
						const { x, y } = value;
						labels[index].element.style.left = `${x}px`;
						labels[index].element.style.top = `${y}px`;
						break;
					case option === 'htmlContent' && typeof value === 'string':
						labels[index].element.innerHTML = value;
						break;
				}
			});
		});

	console.log(`Updating ${arrayOfLabels.length} labels`);
});
