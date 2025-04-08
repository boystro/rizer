# rizer

**rizer** is a lightweight CLI tool to resize images by **width**, **height**, or **ratio**, powered by [sharp](https://www.npmjs.com/package/sharp).

## 📦 Installation

### 1. As a Dev Dependency (local use in projects)

```bash
yarn add -D rizer
# or
npm install --save-dev rizer
```

You can then run it from your project scripts or with `npx`:

```bash
npx rizer input.jpg -w 320,640
```

### 2. As a Global CLI (use from anywhere)

```bash
yarn global add rizer
# or
npm install -g rizer
```

Now you can use it in any folder:

```bash
rizer input.jpg -r 0.25,0.5
```

## 🛠️ Usage

```bash
rizer <image-path> [options]
```

#### Examples

Resize by ratio (default if no options passed):

```bash
# Generates 0.25x, 0.5x, 0.75x versions
rizer photo.jpg
```

With custom options:

```bash
# Generates 0.25x, 0.5x versions
rizer photo.jpg -r 0.25,0.5
```

Resize by **width**:

```bash
rizer photo.jpg -w 320,640
```

Resize by **height**:

```bash
rizer photo.jpg -h 240,480
```

Allow Upscaling:

```bash
rizer photo.jpg -w 1600 -u
```

---

Use `rizer --help` help
