import {
    Directive, Host, Input, TemplateRef, ViewContainerRef
} from "@angular/core";

import { MessagesDirective } from "./messages.directive";

/**
 * @Directive
 * Diretiva estrutural para registrar uma mensagem de validação de erro em determinada situação.
 *
 * @author Giancarlo Dalle Mole
 * @since 08/05/2019
 */
@Directive({
    selector: "[etzMessageError]"
})
export class MessageErrorDirective {

    //#region Inputs
    /**
     * @Input
     * Chave do erro de validação que ativa esta mensagem
     */
    @Input("etzMessageError")
    public etzMessageError: string;
    //#endregion

    //#region Protected Attributes
    /**
     * Referência ao template da diretiva estrutural
     * @injected
     */
    protected readonly templateRef: TemplateRef<any>;
    /**
     * Referência do container no qual o {@link templateRef} pode ser inserido.
     * @injected
     */
    protected readonly viewContainerRef: ViewContainerRef;
    /**
     * Flag que indica se está criado ou não a mensagem.
     * @default false
     */
    protected _created: boolean;
    //#endregion

    //#region Constructor
    constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef,
                @Host() messages: MessagesDirective) {

        // Injetados
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;

        // Protegidos
        this._created = false;

        // Registrar na diretiva mestra de mensagens esta diretiva de mensagem de erro
        messages.addError(this);
    }
    //#endregion

    //#region Getters
    /**
     * Flag que indica se está criado ou não a mensagem.
     */
    public get created(): boolean {
        return this._created;
    }
    //#endregion

    //#region Public Methods
    /**
     * Instanciar o template e colocar no container da view, apresentando a menssagem de erro.
     */
    public create(): void {

        if (!this._created) {

            this.viewContainerRef.createEmbeddedView(this.templateRef);
            this._created = true;
        }
    }

    /**
     * Limpar o conteúdo do container da view, removendo a mensagem de erro.
     */
    public destroy(): void {

        this.viewContainerRef.clear();
        this._created = false;
    }
    //#endregion
}
