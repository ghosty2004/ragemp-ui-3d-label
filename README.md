<p align="center" style="font-size: 24px">A resource which allow to put UI labels into 3D world</p>

<br />

Remember to 🌟 this Github if you 💖 it.

## Features

-   [x] create UI labels intro 3D world coords
-   [x] attach created labels to entities (player, vehicle, object)
-   [x] set bone index of attached entities
-   [x] set offset vector of attached entities
-   [x] variable injection which is evaluated in clientside (only for attached entities for now)

## How to install (precompiled)

-   Download the latest release
-   Move the `server` path from `dist/server` into your `packages/your-gamemode/ui3d` path
-   Move the `client` path from `dist/client` into your `client_packages/ui3d` path

## The variable injection

-   When we attach a label to an entity we can specify various variables such as `health`,`name`,`remoteId` or anything else which is provided by ragemp
-   Ensure that when you inject this variable you use this PREFIX and SUFIX: `%{attachedEntity.variableName}%` like: `%{attachedEntity.name}%`

## API

```ts
interface TextLabelUI3DOptions {
	dimension?: number;
	drawDistance?: number;
	attachedTo?: EntityMp | null;
	attachedAtBoneIndex?: number | null;
	attachedOffset?: Vector3;
}

interface TextLabelMpPool {
	UI3D: {
		new: (htmlContent: string, position: Vector3, options?: TextLabelUI3DOptions) => UI3DTextLabel;
		destroy: (index: number) => void;
		destroyAll: () => void;
		at: (index: number) => UI3DTextLabel;
		exists: (index: number) => boolean;
		toArray(): UI3DTextLabel[];
		length: number;
	};
}
```

## Examples

#### JS:

```js
// packages/your-gamemode/index.js

require('./ui3d');

// create a simple label
mp.labels.UI3D.new("<font color='red' size='20px'>Hello World !</font>", new mp.Vector3(0, 0, 0));

// create a label which can be attached to an entity (usefull for nametag) - we also use variable injection which is evaluated in client
const label = mp.labels.UI3D.new("<font color='red' size='20px'>%{attachedEntity.name}% (%{attachedEntity.remoteId}%)</font>");

label.attachedTo = player; // a player var of type PlayerMp
label.attachedOffset = new mp.Vector3(0, 0, 0.5); // this will evaluated in client: player.position(x/y/z) + label.attachedOffset(x/y/z)
```
