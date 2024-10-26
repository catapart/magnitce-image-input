import style from './image-input.css?raw';
import html from './image-input.html?raw';

const COMPONENT_STYLESHEET = new CSSStyleSheet();
COMPONENT_STYLESHEET.replaceSync(style);

const COMPONENT_TAG_NAME = 'image-input';
export class ImageInputElement extends HTMLElement
{
    componentParts: Map<string, HTMLElement> = new Map();
    getPart<T extends HTMLElement = HTMLElement>(key: string)
    {
        if(this.componentParts.get(key) == null)
        {
            const part = this.shadowRoot!.querySelector(`[part="${key}"]`) as HTMLElement;
            if(part != null) { this.componentParts.set(key, part); }
        }

        return this.componentParts.get(key) as T;
    }
    findPart<T extends HTMLElement = HTMLElement>(key: string) { return this.shadowRoot!.querySelector(`[part="${key}"]`) as T; }

    get files(): FileList|null
    {
        return this.findPart<HTMLInputElement>('input').files;
    }
    #previewURL?: string;

    constructor()
    {
        super();
        this.#internals = this.attachInternals();
        this.#internals.role = "file";
        
        this.attachShadow({ mode: "open" });
        this.shadowRoot!.innerHTML = html;
        this.shadowRoot!.adoptedStyleSheets.push(COMPONENT_STYLESHEET);
        this.findPart('label').tabIndex = 0;

        const placeholderLabel = this.findPart('placeholder-label');
        if(placeholderLabel != null)
        {
            placeholderLabel.textContent = this.getAttribute('placeholder') ?? "🖻 Select an image...";
        }

        // handle required state
        this.updateFormStatus();

        // assign handlers
        const input = this.findPart<HTMLInputElement>('input');
        input.addEventListener("input", () => 
        {
            const value = (input.files == null) ? null : input.files[0];
            this.updateFormStatus();
            this.updatePreview(value)
            this.dispatchEvent(new Event('change'));
        });
        this.addEventListener('keydown', (event: KeyboardEvent) =>
        {
            if(event.code == "Space" || event.code == "Enter" || event.code == "NumpadEnter")
            {
                this.findPart<HTMLInputElement>('input').click();
                event.preventDefault();
                event.stopPropagation();
            }
        });
        this.findPart<HTMLInputElement>('clear').addEventListener("click", (event: Event) => 
        {
            event.preventDefault();
            event.stopPropagation();
            this.value = null;
            this.dispatchEvent(new Event('change'));
            return false;
        });
        this.findPart<HTMLInputElement>('clear').addEventListener("keydown", (event: KeyboardEvent) => 
        {
            if(event.code == "Space" || event.code == "Enter" || event.code == "NumpadEnter")
            {
                event.preventDefault();
                event.stopPropagation();
                this.value = null;
                this.dispatchEvent(new Event('change'));
                return false;
            }
        });

        // allow drag and drop on the top element, since we're hiding
        // the file input, itself
        this.addEventListener('dragover', (event: DragEvent) =>
        {
            event.preventDefault();
        })

        this.addEventListener('drop', (event: DragEvent) =>
        {
            event.preventDefault();
            if(event.dataTransfer == null) { return; }

            const accepted = this.findPart('input').getAttribute('accept')!.split(',')
            .map(item => item.trim());

            if(event.dataTransfer.items)
            {
                const dataItems = [...event.dataTransfer.items];
                for(let i = 0; i < dataItems.length; i++)
                {
                    const item = dataItems[i];
                    if(item.kind == "file")
                    {
                        const file = item.getAsFile();
                        if(file == null)
                        {
                            this.value = file;
                            return;
                        }
                        if(accepted.indexOf(file.type) > -1)
                        {
                            this.value = file;
                        }
                        else
                        {
                            this.dispatchEvent(new CustomEvent('deny', { detail: 
                            { 
                                file, 
                                message: 'File type disallowed by accepted list',
                                accepted
                            }}));
                        }
                    }
                }
            }
            else
            {
                const dataFiles = [...event.dataTransfer.files];
                for(let i = 0; i < dataFiles.length; i++)
                {
                    const file = dataFiles[i];
                    if(file == null)
                    {
                        this.value = file;
                        return;
                    }
                    if(accepted.indexOf(file.type) > -1)
                    {
                        this.value = file;
                    }
                    else
                    {
                        this.dispatchEvent(new CustomEvent('deny', { detail: 
                        { 
                            file, 
                            message: 'File type disallowed by accepted list',
                            accepted
                        }}));
                    }
                }
            }
        })
    }
    
    connectedCallback() 
    {
        this.updateFormStatus();
        this.updatePreview(this.value);
    }  
    
    // custom elements reference
    static observedAttributes = [ 'accept' ];  
    attributeChangedCallback(attributeName: string, _oldValue: string, newValue: string) 
    {  
    // console.log(attributeName, oldValue, newValue);

        if(attributeName == 'accept')
        {
            this.findPart<HTMLInputElement>('input').setAttribute('accept', newValue);
        }
    }

    updatePreview(file: File|null)
    {
        if(file == null)
        {
            this.findPart<HTMLImageElement>('preview').removeAttribute('src');
            this.findPart<HTMLAnchorElement>('view-link').href = "#";
            this.findPart('filename').textContent = "";
            this.removeAttribute('specified');
            const placeholderLabel = this.findPart('placeholder-label');
            if(placeholderLabel != null)
            {
                placeholderLabel.textContent = this.getAttribute('placeholder') ?? "Select an image...";
            }

            this.findPart("label").focus();

            if(this.#previewURL != null)
            {
                window.URL.revokeObjectURL(this.#previewURL);
                this.#previewURL = undefined;
            }
            return;
        }

        this.findPart('filename').textContent = file.name;
        this.toggleAttribute('specified', true);
        
        const reader = new FileReader();
        reader.addEventListener('load', (event) =>
        {
            const result = event.target?.result as string;
            this.findPart<HTMLImageElement>('preview').src = result;
        });
        reader.readAsDataURL(file);
            
        // Create URL 
        this.#previewURL = window.URL.createObjectURL(file);   

        // Create View Link
        this.findPart<HTMLAnchorElement>('view-link').href = this.#previewURL;
    }

    ///// Form Functionality ///// 
    static formAssociated = true; // this allows form event functionality;
    #internals: ElementInternals;

    // #defaultValue: null = null;

    get value(): File|null
    {
        const input = this.findPart<HTMLInputElement>('input');
        return (input.files == null) ? null : input.files[0];
    }
    set value(val: File|null)
    {
        const transfer = new DataTransfer();
        if(val != null)
        {
            transfer.items.add(val);
        }
        const input = this.findPart<HTMLInputElement>('input');
        input.files = transfer.files;
        this.updateFormStatus();
        this.updatePreview((input.files == null) ? null : input.files[0]);
    }
  
    get validity() 
    {
        return this.#internals.validity;
    }

    #validationMessage: string = "Please fill out this field.";
    get validationMessage() 
    {
        return this.#validationMessage;
    }
    setCustomValidity(value: string)
    {
        this.#validationMessage = value;
        const input = this.findPart<HTMLInputElement>('input');
        const formValue = (input.files == null) ? null : input.files[0];
        this.#internals.setValidity(
            { valueMissing: (this.getAttribute('required') != null && formValue == null) },
            this.#validationMessage,
            this.findPart('label')
        );
    }
  
    formDisabledCallback(disabled: boolean) 
    {
        this.findPart<HTMLInputElement>('input').disabled = disabled;
    }

    formResetCallback() 
    {
        this.value = null;
    }

    checkValidity() 
    {
        return this.#internals.checkValidity();
    }
    reportValidity() 
    {
        return this.#internals.reportValidity();
    }

    updateFormStatus()
    {
        const input = this.findPart<HTMLInputElement>('input');
        const formValue = (input.files == null) ? null : input.files[0];
        this.#internals.setValidity(
            { valueMissing: (this.getAttribute('required') != null && formValue == null) },
            this.#validationMessage,
            this.findPart('label')
        );
        
        this.#internals.setFormValue(formValue);
    }
}

if(customElements.get(COMPONENT_TAG_NAME) == null)
{
    customElements.define(COMPONENT_TAG_NAME, ImageInputElement);
}