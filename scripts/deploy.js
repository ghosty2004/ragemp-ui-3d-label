import { readdir, cp } from 'node:fs/promises';

const movePathContent = async (sourcePath, destinationPath) => {
	const files = await readdir(`./dist/${sourcePath}`);

	for (const file of files) {
		await cp(`./dist/${sourcePath}/${file}`, `${destinationPath}/${file}`, { recursive: true });
		console.log(`Copied ${sourcePath}/${file} to ${destinationPath}/${file}`);
	}
};

await movePathContent('client', '../client_packages');
await movePathContent('server', '../packages/3d_ui');
