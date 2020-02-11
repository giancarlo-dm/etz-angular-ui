import { DOCUMENT } from "@angular/common";
import {
    AfterViewInit, Directive, DoCheck, ElementRef, Inject, Injector, Input, OnChanges, SimpleChanges
} from "@angular/core";
import { AbstractControl, NgControl } from "@angular/forms";
import { IllegalArgumentException } from "@enterprize/exceptions";

import { MessageErrorDirective } from "./message-error.directive";
import { MessageErrorDefaultDirective } from "./message-error-default.directive";

/**
 * @Directive
 * Diretiva para apresentação de mensagens de validação. Pode trabalhar de duas maneiras: Input com
 * objeto de mensagens (chave = erro de validação, valor = mensagem) ou por meio de estrutura html
 * com diretivas estruturais <code>*etzMessageError</code> e <code>*etzMessageErrorDefault</code>.
 * É provido a classe css <code>.validation-messages</code> com estilo padrão da biblioteca.
 *
 * @example
 * // Input de mensagens
 * <div class="validation-messages"
 *      etzMessages [messages]="messages">
 * </div>
 *
 * // Diretivas estruturais
 * <div class="validation-messages"
 *      etzMessages [control]="myControl">
 *      <div *etzMessageError="'required'">My label um dois três um dois três é requerido dasda dasd a</div>
 *      <div *etzMessageError="'excluded'">O valor selecionado é inválido</div>
 * </div>
 *
 * @author Giancarlo Dalle Mole
 * @since 08/05/2019
 */
@Directive({
    selector: "[etzMessages]"
})
export class MessagesDirective implements AfterViewInit, OnChanges, DoCheck {

    //#region Inputs
    /**
     * @Input
     * O controle a ser observado pelas mensagens de validação. Caso não seja passado, tentará obter
     * por meio do <code>Injector</code> o controle mais próximo (tenha cuidado, recomendado apenas
     * para componentes cutomizados que implementam a interface ControlValueAcessor e tem controle
     * interno de apresentação de mensagens de validação).
     * @optional
     */
    @Input()
    public control: AbstractControl | NgControl;
    /**
     * @Input
     * Lista de mensagens a serem exibidas de forma programática.
     * @optional
     */
    @Input()
    public messages: {[key: string]: string};
    //#endregion

    //#region Protected Attributes
    /**
     * Referência ao {@link Document} da página.
     * @injected
     */
    protected readonly document: Document;
    /**
     * Referência ao elemento que a diretiva foi aplicada. Utilizado para apresentar as mensagens
     * caso seja usado a opção de chave/valor {@link messages}.
     * @injected
     */
    protected readonly element: ElementRef;
    /**
     * Injetor do Angular. Usado para recuperar um {@link NgControl} disponível caso não seja passado um
     * {@link AbstractControl} em {@link control}.
     * @injected
     */
    protected readonly injector: Injector;
    /**
     * Lista de diretivas estruturais de mensagens de erro. Usado se configurado mensagens por meio
     * de template (html).
     */
    protected readonly messagesError: Array<MessageErrorDirective>;
    /**
     * Lista de diretivas estruturais de mensagens de erro padrões. Usado se configurado mensagens por
     * meio de template (html).
     */
    protected readonly messagesErrorDefault: Array<MessageErrorDefaultDirective>;
    protected initialized: boolean = false;
    protected oldControlErrors: {[key: string]: any}|null;
    protected isTouched: boolean;
    //#endregion

    //#region Constructor
    constructor(@Inject(DOCUMENT) document: any, element: ElementRef, injector: Injector) {

        // Injetados
        this.document = document;
        this.element = element;
        this.injector = injector;

        // Protegidos
        this.messagesError = [];
        this.messagesErrorDefault = [];
    }
    //#endregion

    //#region Lifecycle Hooks
    /**
     * @inheritDoc
     */
    public ngOnChanges(changes: SimpleChanges): void {

        if (changes.control != null && !changes.control.isFirstChange()) {

            if (this.control == null) {
                throw new IllegalArgumentException("A control must be set to use validation messages. It must be set on \"control\" input or be available on the injector", "control");
            }
            else {
                this.oldControlErrors = this.control.errors;
                this.updateMessages();
            }
        }
    }

    /**
     * @inheritDoc
     */
    public ngAfterViewInit(): void {

        if (this.control == null) {
            this.control = this.injector.get(NgControl, null);
        }

        if (this.control == null) {
            throw new IllegalArgumentException("A control must be set to use validation messages. It must be set on \"control\" input or be available on the injector", "control");
        }

        this.oldControlErrors = this.control.errors;
        this.isTouched = this.control.touched;
        this.updateMessages();
        this.initialized = true;
    }

    /**
     * @inheritDoc
     */
    public ngDoCheck(): void {

        if (this.initialized) {

            let hasNewErrors: boolean = false;
            if ((this.control.errors != null && this.oldControlErrors == null) ||
                (this.control.errors == null && this.oldControlErrors !== null)) {
               hasNewErrors = true;
            }
            else if (this.control.errors != null && this.oldControlErrors != null) {

                const oldErrorKeys: Array<PropertyKey> = Reflect.ownKeys(this.oldControlErrors);
                const errorKeys: Array<PropertyKey> = Reflect.ownKeys(this.control.errors);

                if (oldErrorKeys.length != errorKeys.length) {
                    hasNewErrors = true;
                }
                else {
                    hasNewErrors = false;
                    for (let oldErrorKey of oldErrorKeys) {
                        if (!errorKeys.includes(oldErrorKey)) {
                            hasNewErrors = true;
                            break;
                        }
                    }
                }
            }

            if (hasNewErrors) {
                this.updateMessages();
                this.oldControlErrors = this.control.errors;
            }
        }
    }
    //#endregion

    //#region Public Methods
    /**
     * Adicionar uma diretiva estrutural de mensagem de erro.
     * @param messageError A diretiva estrutural a ser adicionada.
     */
    public addError(messageError: MessageErrorDirective): void {
        this.messagesError.push(messageError);
    }

    /**
     * Adicionar uma diretiva estrutural de mensagem de erro padrão.
     * @param messageErrorDefault A diretiva estrutural a ser adicionada.
     */
    public addDefaultError(messageErrorDefault: MessageErrorDefaultDirective): void {
        this.messagesErrorDefault.push(messageErrorDefault);
    }
    //#endregion

    //#region Protected Methods
    /**
     * Atualizar apresentação de mensagens
     */
    protected updateMessages(): void {

        if (this.control.invalid) {
            this.destroyMessages();
            this.createMessages();
        }
        else {
            this.destroyMessages();
        }
    }

    /**
     * Criar mensagens de validação e apresentar.
     */
    protected createMessages(): void {

        const errorKeys: Array<PropertyKey> = Reflect.ownKeys(this.control.errors != null ? this.control.errors : {});
        const errorKey: PropertyKey = errorKeys[0];

        if (this.messages != null) {

            const messageElement: HTMLDivElement = this.document.createElement("div");

            if (Reflect.has(this.messages, errorKey)) {

                messageElement.innerText = Reflect.get(this.messages, errorKey);
                (this.element.nativeElement as HTMLElement).appendChild(messageElement);
            }
            else if (Reflect.has(this.messages, "default")) {

                messageElement.innerText = Reflect.get(this.messages, "default");
                (this.element.nativeElement as HTMLElement).appendChild(messageElement);
            }
        }
        else {

            let matched: boolean = false;
            for (let messageError of this.messagesError) {

                if (messageError.etzMessageError === errorKey) {
                    messageError.create();
                    matched = true;
                }
                else {
                    messageError.destroy();
                }
            }

            if (!matched && this.messagesErrorDefault.length > 0) {
                this.messagesErrorDefault[0].create();
            }
        }
    }

    /**
     * Destruir as mensagens de validação sendo apresentadas.
     */
    protected destroyMessages(): void {

        if (this.messages != null) {
            (this.element.nativeElement as HTMLElement).innerHTML = null;
        }
        else {
            for (let messageError of this.messagesError) {
                messageError.destroy();
            }

            for (let messageErrorDefault of this.messagesErrorDefault) {
                messageErrorDefault.destroy();
            }
        }
    }
    //#endregion
}
