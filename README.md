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

const label = mp.labels.UI3D.new("<div style='background-color: black; padding: 5px; color: white;'>Cool</div>", new mp.Vector3(0, 0, 0));

// destroys the created label
label.destroy();

label.htmlContent = ''; // changes html content
label.position = new mp.Vector3(0, 0, 0); // changes position
label.dimension = 1337; // changes dimension (where the label is displayed)
label.drawDistance = 300; // changes drawDistance (default 200)

// attaches the label created to an entity (this can be a player, object, vehicle)
label.attachedTo = mp.players.at(0); // attaches to a player with id 0
label.attachedTo = mp.vehicles.at(0); // attaches to a vehicle with id 0
label.attachedTo = mp.objects.at(0); // attaches to an object with id 0

// attaches to a bone index
label.attachedAtBoneIndex = 99; // attaches to the player's head
label.attachedOffset = new mp.Vector3(0, 0, 0.3); // puts slightly above the head (if attachedAtBoneIndex is not present, it evaluates as world pos + offset)

// also: provides variable injection (only when attached to an entity)
label.attachedTo = mp.players.at(0);
label.htmlContent = "<font color='red' size='20px'>%{attachedTo.name}% (%{attachedTo.remoteId}%)</font>"; // this is evaluated on the client side only
```
