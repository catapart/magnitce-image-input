# `<image-input>` Element
A custom `HTMLInputElement` that accepts an image and provides a simple preview for common image value use-cases.

Package size: ~7kb minified, ~9kb verbose.

## Quick Reference
```html
<form>
    <image-input name="custom-image" accept="image/gif, image/jpeg">
        <span slot="placeholder">
            <span class="icon"><img src="custom-image-icon.png" /></span>
            <span class="title">Click or Drag and Drop an image here</span>
        </span>
    </image-input>
</form>
<script type="module" src="/path/to/image-input[.min].js"></script>
```
*Note: For selecting other types of files, without the need for in-form previews, consider the [`<file-input>` element](https://github.com/catapart/magnitce-file-input).*

## Demos
https://catapart.github.io/magnitce-image-input/demo/

## Support
- Firefox
- Chrome
- Edge
- <s>Safari</s> (Has not been tested; should be supported, based on custom element support)

## Getting Started
 1. [Install/Reference the library](#referenceinstall)

### Reference/Install
#### HTML Import (not required for vanilla js/ts; alternative to import statement)
```html
<script type="module" src="/path/to/image-input[.min].js"></script>
```
#### npm
```cmd
npm install @magnit-ce/image-input
```

### Import
#### Vanilla js/ts
```js
import "/path/to/image-input[.min].js"; // if you didn't reference from a <script>, reference with an import like this

import { ImageInputElement } from "/path/to/image-input[.min].js";
```
#### npm
```js
import "@magnit-ce/image-input"; // if you didn't reference from a <script>, reference with an import like this

import { ImageInputElement } from "@magnit-ce/image-input";
```

---
---
---

## Overview
The `<image-input>` element is was designed to simplify image collection in forms. While the file input provides plenty of great functionality, like the file selection dialog, it doesn't provide for extremely common use-cases like displaying the image that was selected.

In addition to providing a preview, the `<image-input>` element allows for a custom and style-able placeholder, and links for clearing the input and viewing the selected image in a new tab.

## Attributes
|Attribute Name|Description|
|-|-|
|`placeholder`|Sets the text content of the placeholder.|
|`name`|When used in a `<form>`, assigns a property name to the `FormData` object that is generated from that `<form>` element.|
|`accept`|Defines the types of files that are able to be selected. Default Value: `image/apng, image/avif, image/gif, image/jpeg, image/png, image/svg+xml, image/webp`|
|`required`|When used in a `<form>`, prevents the `<form>` from submitting unless an image has been selected by this input. Also provides the `:invalid` state for styling, when no file has been selected.|

## Events
The `<image-input>` element dispatches a `change` event when a file has been selected, or a selection is cleared. Like other inputs, the event can be handled and the value can be collected by accessing the `<image-input>` element's `value` property. Like other `file` type inputs, the selected image can also be collected by accessing the `files` property, with an index of the target selection.

```html
<image-input></image-input>
<script>
    const input = document.querySelector('image-input');
    input.addEventListener('change', (event) =>
    {
        console.log(event.target.value);
        console.log(event.target.files);
    });
</script>
```

In addition to the `change` event, the `<image-input>` element also dispatches a `deny` event if a user attempts to drop a file on the input when that input's `accept` attribute has disallowed that file type.  
The `deny` event is a `CustomEvent` with a `detail` property that provides the file the user dropped, the error message, and the list of acceptable file types for that input.

In this example, the `deny` event is being handled by logging each of the detail properties:
```html
<image-input></image-input>
<script>
    const input = document.querySelector('image-input');
    input.addEventListener('deny', (event) =>
    {
        console.error(event.detail.message);
        console.info(event.detail.accepted);
        console.log(event.detail.file.name, event.detail.file.size);
    });
</script>
```

## Parts
|Part Name|Description|Element
|-|-|-|
|`label`|A `<label>` element that acts as a container and provides click functionality for invoking the nested input.|`HTMLLabelElement`|
|`input`|The input that invokes the browser functionality like launching a file browser. Hidden by default.|`HTMLInputElement[type="file"]`|
|`field`|The container for the placeholder, the preview, and the labels. This part includes everything that is not the "Clear" and "View Fullsize" links.|`HTMLSpanElement`|
|`thumbnail`|The container for the placeholder's icon, as well as the image preview, when a file has been selected.|`HTMLSpanElement`|
|`placeholder-icon`|Displays the placeholder's icon. Hidden when a selection has been made.|`HTMLSpanElement`|
|`preview`|The selected image rendered into a `<img>` tag. Hidden when there is no selection.|`HTMLImageElement`|
|`status`|A container for either the placeholder text, or the filename of the selected image.|`HTMLSpanElement`|
|`filename`|Displays the filename of the selected image. Hidden when there is no selection.|`HTMLSpanElement`|
|`placeholder-label`|Displays the placeholder text. Hidden when a selection has been made.|`HTMLSpanElement`|
|`clear`|A link that clears the input, if a selection has been made.|`HTMLAnchorElement`|
|`view-link`|A link that opens the selected image file in a new browser context (tab/window).|`HTMLAnchorElement`|

## Slots
The `<image-input>` element exposes the following `slot`s: 
|Slot Name|Description|Default
|-|-|-|
|`placeholder`|Text content displayed whenever a selection has not been made.|`HTMLSpanElement`|
|`placeholder-icon`|An icon displayed whenever a selection has not been made.|`HTMLSpanElement`|
|`clear`|A link that clears the input, if a selection has been made.|`HTMLAnchorElement`|
|`view-link`|A link that opens the selected image file in a new browser context (tab/window).|`HTMLAnchorElement`|

## Styling
The `<image-input>` element can be styled with CSS, normally with limited effect. The `<image-input>` element also utilizes the shadowDOM for layout, so styling the internal layout elements must be done using a `::part()` selector.

Unlike other inputs, the `<image-input>` element includes elements that are not normally considered part of the "input" area. The "Clear" and "View Fullsize" links are not contained within the area that is traditionally understood as the "field".  
Because of this, most of the styling that would be done to an `<input>` element should be done to the `field` part, instead. For example, setting the `border` or `background-color` should be done on the `field` part, rather than on the `<image-input>` element.

In this example, the `field` part is being selected for styling:
```css
image-input::part(field)
{
    /* styling */
}
```
For a list of all part names, see the [parts](#parts) section.

Due to the nature of the `::part()` selector, and for general convenience, the `<image-input>` element also implements a `--border-color` variable that can be set on the element, which will act on the field like any other input.  
For example, both of these inputs are targeted to represent an `:invalid` state:
```css
input[type="text"]:invalid
{
    border-color: red;
}
image-input:invalid
{
    /* unlike other inputs, the image-input includes links that
    *  are outside of its field. to simplify setting the field
    *  border color, --border-color has been provided
    */
    --border-color: red;
}
```

As an additional convenience, the `<image-input>` element provides a block-style layout option, rather than the default inline-style layout. Assigning the `block` class will, like in this example, will render the input in the block-style layout:
```html
<image-input class="block"></image-input>
```

## License
This library is in the public domain. You do not need permission, nor do you need to provide attribution, in order to use, modify, reproduce, publish, or sell it or any works using it or derived from it.