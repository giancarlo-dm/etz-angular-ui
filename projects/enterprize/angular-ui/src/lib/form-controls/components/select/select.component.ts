import { DOCUMENT } from "@angular/common";
import {
    Component, ElementRef, forwardRef, HostListener, Inject, Injector, Input, SimpleChanges,
    TemplateRef, ViewChild, ViewEncapsulation
} from "@angular/core";
import {
    AbstractControl, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors,
    Validator
} from "@angular/forms";
import { IllegalArgumentException } from "@enterprize/exceptions";
import { from, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, tap } from "rxjs/operators";
import { normalizeSync } from "normalize-diacritics";
import { PaginatedResult } from "../../../core/common/paginated-result.class";
import { Placement } from "../../../popovers/common/placements.type";
import { AbstractFormComponent } from "../../common/abstract-form-component.class";
import { Action } from "../../common/action.type";
import { Fetcher } from "../../common/fetcher.interface";
import { PaginatedFetcher } from "../../common/paginated-fetcher.interface";
import { SelectItem } from "../../common/select-item.class";

/**
 * @Component
 * Componente de seleção de itens (análogo a <select> e ComboBox) com funcionalidades de busca de itens,
 * filtragem por lista de exclusão, listas estáticas e dinâmicas (sync/async), paginação de itens
 * (apenas listas dinâmicas), seção de últimos itens selecionados conforme contexto, seção de ações
 * e cache de itens conforme contexto.
 *
 * @author Giancarlo Dalle Mole
 * @since 20/03/2019
 */
@Component({
    selector: "etz-select",
    templateUrl: "./select.component.html",
    styleUrls: ["./select.component.scss"],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => SelectComponent),
            multi: true
        }
    ]
})
export class SelectComponent<T> extends AbstractFormComponent<T> implements Validator {

    //#region Inputs
    /**
     * @Input
     * Lista de ações a serem colocadas.
     * @optional
     */
    @Input()
    public actions: Array<Action<T, any>>;
    /**
     * @Input
     * Lista de itens estáticos a ser apresentado. Quando utilizado este meio de definição de itens,
     * a funcionalidade de busca utiliza lógica baseada em expressão regular.
     */
    @Input()
    public items: Array<T>;
    /**
     * @Input
     * Callback para otenção de itens de forma dinâmica (sync/async). Quando utilizado este meio de
     * definição de itens, a funcionalidade de busca pode utilizar lógica baseada em expressão regular
     * ou a definida no callback fazendo com que este seja chamado a cada alteração notexto de busca.
     * A configuração do modo de busca se dá pelo atributo {@link searchOnFetcher}.
     * @callback
     */
    @Input()
    public fetcher: Fetcher<T>;
    /**
     * @Input
     * Callback para otenção de itens de forma dinâmica (sync/async) com paginação. Quando utilizado
     * este meio de definição de itens, a funcionalidade de busca depende apenas do resultado deste
     * callback, sendo este invocado a cada alteração no texto de busca.
     * @callback
     */
    @Input()
    public paginatedFetcher: PaginatedFetcher<T>;
    /**
     * @Input
     * Callback para gerar texto de apresentação custom e permitir busca sobre texto.
     */
    @Input()
    public display: (item: T) => string;
    /**
     * @Input
     * Flag que indica se aplica a lógica padrão de busca quando utilizado {@link fetcher}. Se
     * desabilitado, a cada alteração da busca, o callback de fetch será invocado com o texto de busca.
     * Sem efeito em listas estáticas ou paginadas.
     * @default true
     */
    @Input()
    public searchOnFetcher: boolean;
    /**
     * @Input
     * Lista de itens a serem filtrados.
     */
    @Input()
    public exclusionList: Array<T>;
    /**
     * @Input
     * Chave de objeto a utilizar para comparação ao invés de apenas referências.
     * @optional
     */
    @Input()
    public key: keyof T;
    /**
     * @Input
     * Posicionamento da caixa de seleção.
     * @default bottom-right
     */
    @Input()
    public placement: Placement;
    /**
     * @Input
     * Template customizado para apresentação do item.
     * @default Apresentação apenas de texto do item.
     */
    @Input()
    public template: TemplateRef<any>;
    /**
     * @Input
     * Template customizado para apresentação do item de ação.
     * @default Apresentação de icone + texto do item.
     */
    @Input()
    public actionTemplate: TemplateRef<any>;
    //#endregion

    //#region Public Attributes
    /**
     * Lista paginada de itens do menu de seleção.
     */
    public selectItems: Array<SelectItem<T>>;
    /**
     * Item atualmente selecionado.
     */
    public selectedItem: SelectItem<T>;
    /**
     * Controle de pesquisa rápida.
     */
    public readonly searchControl: FormControl;
    /**
     * Tipo de fonte dos itens de seleção. STATIC é lista estática passada por binding. FETCHER é lista
     * obitida por meio da execução de callback (sync/async) e PAGINATED_FETHCER é semelhante ao FETCHER
     * porém o resultado é paginado e a busca de itens depende do callback.
     */
    public sourceType: "STATIC" | "FETCHER" | "PAGINATED_FETCHER";
    /**
     * Flag que indica que esta em processo de obtenção de itens de forma dinâmica, podendo ser
     * assíncrono.
     * @default false
     */
    public isLoadingItems: boolean;
    /**
     * Flag que indica se está sendo digitado no campo de busca.
     * @default false
     * @readonlyProperty
     */
    public isTypingInSearch: boolean;
    /**
     * Número total de itens disponíveis.
     */
    public totalItems: number;
    /**
     * Número total de páginas.
     * @default 1
     */
    public totalPages: number;
    /**
     * Página atual. Usado com fetcher dinâmico.
     * @default 1
     */
    public currentPage: number;
    /**
     * Textos
     */
    public i18n = {items: {'=1': 'item', 'other': 'itens'}};
    //#endregion

    //#region Protected Attributes
    /**
     * @ViewChild
     * Referência do elemento de campo de busca.
     */
    @ViewChild("searchInput", { static: true })
    protected searchInput: ElementRef<HTMLInputElement>;
    /**
     * @ViewChild
     * Referência do elemento de botão de acionamento do menu de seleção.
     */
    @ViewChild("selectMenuBtn", { static: true })
    protected selectMenuBtn: ElementRef<HTMLInputElement>;
    /**
     * Item nulo. Usado para incluir opção "-- Selecione --" cujo modelo é nulo.
     */
    public readonly nullItem: SelectItem<T>;
    /**
     * Callback a ser invocado para reexecutar a validação. Usado quando ocorreu alguma alteração de
     * estado interno que pode afetar a validação.
     * @callback
     */
    protected onValidatorChange: () => void = () => undefined;
    /**
     * Expressão regular de busca
     */
    protected searchRegex: RegExp;
    /**
     * Flag que indica se já foi efetuado a geração de items. Usado para controlar geração de itens
     * no modo "lazy" (itens dinâmicos) que são gerados apenas quando o menu de seleção é aberto.
     * @default false
     */
    protected hasGeneratedItems: boolean;
    /**
     * Assinatura atual da geração de items. Usado para evitar apresentar items em caso de refetch
     * executado enquanto outro fetch ainda estava em progresso.
     */
    protected generateItemsSubscription: Subscription;
    /**
     * Flag que indica se já foi inicializado o componente (ngOnInit called).
     * @default false
     */
    protected isInitialized: boolean;
    //#endregion

    //#region Private Attributes
    /**
     * Flag que indica status de abertura do menu de seleção de itens
     * @default false
     */
    private _isOpen: boolean;
    //#endregion

    //#region Constructor
    constructor(@Inject(DOCUMENT) document: any, elementRef: ElementRef<HTMLElement>,
                injector: Injector) {
        super(document, elementRef, injector, "etz-select");

        // Protegidos
        this.nullItem = new SelectItem<T>(null, "-- Selecione --");
        this.isInitialized = false;
        this.onValidatorChange = () => undefined;

        // Públicos
        this.searchControl = new FormControl(null);
    }
    //#endregion

    //#region Lifecycle Hooks
    /**
     * @inheritDoc
     */
    public ngOnInit(): void {

        super.ngOnInit();

        // Validate bindings
        if ((this.items != null && this.fetcher != null) ||
            (this.items != null && this.paginatedFetcher != null) ||
            (this.fetcher != null && this.paginatedFetcher != null)) {
            throw new IllegalArgumentException("Cannot set static items and fetchers at the same time. Choose one!", "items;fetcher;paginatedFetcher");
        }

        // Default bindings
        this.placement = this.placement != null ? this.placement : "bottom-right";
        this.searchOnFetcher = this.searchOnFetcher != null ? this.searchOnFetcher : true;
        this.display = this.display != null ? this.display : (item: T) => String(item);

        this.reset();

        this.searchControl.valueChanges
            .pipe(
                tap(() => this.isTypingInSearch = true),
                distinctUntilChanged(),
                debounceTime(1000),
                tap(() => this.isTypingInSearch = false)
            )
            .subscribe((value: string|null) => {

                this.currentPage = 1;
                this.totalPages = 1;
                this.totalItems = 0;

                if (value != null && value.length === 0) {
                    this.searchControl.setValue(undefined, {emitEvent: false});
                }

                if (this.sourceType === "STATIC" ||
                    (this.sourceType === "FETCHER" && this.searchOnFetcher)) {

                    this.searchRegex = value != null && value.length > 0 ? new RegExp(normalizeSync(value).trim().toLowerCase()) : new RegExp("");

                    if (this.hasGeneratedItems) {
                        this.applyFilters(true, true);
                    }
                }
                else {
                    this.initItems();
                }
            });

        this.isInitialized = true;
    }

    /**
     * @inheritDoc
     */
    public ngOnChanges(changes: SimpleChanges): void {

        super.ngOnChanges(changes);

        // Se ainda não foi inicializado, retornar
        if (!this.isInitialized) {
            return;
        }

        // Validate bindings
        if ((this.items != null && this.fetcher != null) ||
            (this.items != null && this.paginatedFetcher != null) ||
            (this.fetcher != null && this.paginatedFetcher != null)) {
            throw new IllegalArgumentException("Cannot set static items and fetchers at the same time. Choose one!", "items;fetcher;paginatedFetcher");
        }

        // Default bindings
        this.placement = this.placement != null ? this.placement : "bottom-right";
        this.searchOnFetcher = this.searchOnFetcher != null ? this.searchOnFetcher : true;
        this.display = this.display != null ? this.display : (item: T) => String(item);

        if ((changes.display != null || changes.searchOnFetcher != null || changes.items != null ||
            changes.fetcher != null || changes.paginatedFetcher != null) ||
            ((changes.display != null || changes.searchOnFetcher != null || changes.items != null ||
              changes.fetcher != null || changes.paginatedFetcher != null) && changes.exclusionList != null)) {

            this.reset();
        }
        else if (changes.exclusionList != null) {

            this.applyFilters(false, true);
            this.onValidatorChange();
        }
    }
    //#endregion

    //#region Getters and Setters
    /**
     * Flag que indica status de abertura do menu de seleção de itens.
     */
    public get isOpen(): boolean {
        return this._isOpen;
    }

    public set isOpen(value: boolean) {

        this._isOpen = value;

        // se foi aberto o menu de seleção e ainda não foi gerado os itens (lazy), gerar itens
        if (this._isOpen && !this.hasGeneratedItems) {
            this.initItems();
        }

        //Se aberto, focar automaticamente o campo de busca rápida
        if (this._isOpen) {

            this.searchControl.markAsTouched();
            setTimeout(() => this.searchInput.nativeElement.focus());
        }
        else {
            setTimeout(() => this.selectMenuBtn.nativeElement.focus());
        }
    }
    //#endregion

    //#region Host Listeners
    /**
     * Host listener para eventos de click. Caso seja clicado fora
     * @param event
     */
    @HostListener("document:click", ["$event"])
    public onClickOutside(event: MouseEvent) {

        if (this.isOpen && !this.elementRef.nativeElement.contains(event.target as HTMLElement)) {
            this.isOpen = false;
        }
    }
    //#endregion

    //#region AbstractFormComponent Methods
    /**
     * @inheritDoc
     */
    protected onOuterChange(oldModelValue: T, newModelValue: T): void {

        let found: boolean = false;
        for (let selectItem of this.selectItems) {

            if (this.isValueEquals(selectItem.value, this.model)) {

                this.selectedItem.selected = false;
                this.selectedItem = selectItem;
                this.selectedItem.selected = true;

                found = true;
                break;
            }
        }

        //se não, cria um item temporário
        if (!found) {

            this.selectedItem.selected = false;
            this.selectedItem = new SelectItem(newModelValue, this.display(newModelValue)); //item temporário, será sobrescrito quando efetuar o fetch e o resultado conter o item
            this.selectedItem.selected = true;
        }

        this._isOpen = false;
        this.clearFilters(true, false);
    }
    //#endregion

    //#region Validator Methods
    /**
     * @inheritDoc
     */
    public validate(control: AbstractControl): ValidationErrors | null {

        if (this.isInExclusionList(control.value)) {
            return {excluded: {item: control.value}};
        }

        return null;
    }

    /**
     * @inheritDoc
     */
    public registerOnValidatorChange(cb: () => void): void {
        this.onValidatorChange = cb;
    }
    //#endregion

    //#region Public Methods
    /**
     * Inicializar/Reinicializar controle.
     */
    public reset(): void {

        if (this.items != null) {
            this.sourceType = "STATIC";
        }
        else if (this.fetcher != null) {
            this.sourceType = "FETCHER";
        }
        else if (this.paginatedFetcher != null) {
            this.sourceType = "PAGINATED_FETCHER";
        }
        else {
            this.sourceType = "STATIC";
            this.items = [];
        }

        this._isOpen = false;
        this.isLoadingItems = false;
        this.isTypingInSearch = false;
        this.hasGeneratedItems = false;
        this.searchRegex = new RegExp("");
        this.searchControl.setValue(null, {emitEvent: false});
        this.totalPages = 1;
        this.currentPage = 1;
        this.totalItems = 0;
        this.selectItems = [this.nullItem];
        this.selectedItem = this.nullItem;
        this.nullItem.selected = true;
        this.model = this.selectedItem.value;

        // se a lista de itens é estática, gerar os items
        if (this.sourceType === "STATIC") {
            this.initItems();
        }

        this.onValidatorChange();
    }

    /**
     * Selecionar um item do menu se seleção.
     * @param item (opcional) O item a ser selecionado. Se não passado, será selecionado o primeiro
     * item válido da lista.
     */
    public selectItem(item?: SelectItem<T>): void {

        //se não foi passado, selecionar o primeiro item válido da lista
        if (item == null) {

            if (!this.nullItem.hidden) {
                return;
            }

            let hasItem: boolean = false;

            for (let selectItem of this.selectItems) {

                if (!selectItem.hidden && !selectItem.disabled) {
                    item = selectItem;
                    hasItem = true;
                    break;
                }
            }

            if (!hasItem) {
                item = this.nullItem;
            }
        }

        this.selectedItem.selected = false;
        this.selectedItem = item;
        this.selectedItem.selected = true;
        this.model = this.selectedItem.value;

        this.isOpen = false;
        this.clearFilters(true, false);
    }

    /**
     * Em listagens paginadas, avançar a página efetuando fetch.
     */
    public nextPage(): void {

        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.initItems();
        }
    }

    /**
     * Em listagens paginadas, retroceder a página efetuando fetch.
     */
    public previousPage(): void {

        if (this.currentPage > 0) {
            this.currentPage--;
            this.initItems();
        }
    }

    /**
     * Executar uma ação do menu de ações
     * @param action A ação a ser executada
     */
    public runAction(action: Action<T, any>): void {

        if (action.close) {
            this.isOpen = !this.isOpen;
        }

        action.listener(this);
    }
    //#endregion

    //#region Protected Methods
    /**
     * Inicializar itens de seleção
     */
    public initItems(): void {

        this.isLoadingItems = true;

        if (this.generateItemsSubscription != null) {
            this.generateItemsSubscription.unsubscribe();
        }

        this.generateItemsSubscription = from(this.generateSelectItems())
            .subscribe(
                generated => {

                    this.selectItems = generated.selectItems;
                    this.totalPages = generated.totalPages;
                    this.totalItems = generated.totalItems;

                    for (let selectItem of this.selectItems) {

                        if (this.isValueEquals(selectItem.value, this.model)) {

                            this.selectedItem.selected = false;
                            this.selectedItem = selectItem;
                            this.selectedItem.selected = true;
                            break;
                        }
                    }

                    if (this.sourceType === "STATIC" ||
                        (this.sourceType === "FETCHER" && this.searchOnFetcher)) {
                        this.applyFilters(true, true);
                    }
                    else {
                        this.applyFilters(false, true);
                    }

                    this.hasGeneratedItems = true;
                    this.isLoadingItems = false;
                },
            error => {
                    console.error(error);
                    this.isLoadingItems = false;
                }
            );
    }

    /**
     * Gerar a lista de items para seleção.
     */
    protected async generateSelectItems(): Promise<{totalPages: number, totalItems: number, selectItems: Array<SelectItem<T>>}> {

        const selectItems: Array<SelectItem<T>> = [];
        let totalItems: number = 0;
        let totalPages: number = 1;

        selectItems.push(this.nullItem);

        let items: Array<T> | PaginatedResult<T>;

        if (this.sourceType === "STATIC") {

            items = this.items as Array<T>;
            totalItems = (this.items as Array<T>).length;
            totalPages = 1;
        }
        else if (this.sourceType === "FETCHER") {

            items = await this.fetcher.call(null, this.searchOnFetcher ? undefined : this.searchControl.value) as Array<T>;

            totalItems = items.length;
            totalPages = 1;
        }
        else {

            items = await this.paginatedFetcher.call(null, this.searchControl.value, this.currentPage) as PaginatedResult<T>;

            totalItems = items.metadata.total;
            totalPages = Math.ceil(items.metadata.total / items.metadata.limit);
        }

        for (let item of items) {
            selectItems.push(new SelectItem<T>(item, this.display(item)));
        }

        return {
            totalItems: totalItems,
            totalPages: totalPages,
            selectItems: selectItems
        };
    }

    /**
     * Aplicar filtros de busca e itens excluídos.
     */
    protected applyFilters(search: boolean, exclusionList: boolean): void {

        if (search) {
            this.totalItems = this.selectItems.length - 1; // excluir item "nulo" da contagem de total de items
        }

        for (let selectItem of this.selectItems) {

            // verificar se está com pesquisa e remover o item "nulo"
            if (selectItem === this.nullItem) {

                if (this.searchControl.value != null && this.searchControl.value.length > 0) {

                    if (selectItem === this.nullItem) {
                        selectItem.hidden = true;
                    }
                }
                else {
                    selectItem.hidden = false;
                }
            }
            else {
                // Search Filter
                if (search) {

                    selectItem.hidden = !this.isInSearch(selectItem);
                    if (selectItem.hidden && selectItem !== this.nullItem) {
                        this.totalItems--;
                    }
                }
                else {
                    selectItem.hidden = false;
                }
            }

            // Exclusion List Filter
            if (exclusionList) {
                selectItem.disabled = this.isInExclusionList(selectItem.value);
            }
            else {
                selectItem.disabled = false;
            }
        }
    }

    /**
     * Limpar filtros aplicados.
     * @param search Flag para limpar filtro de busca.
     * @param exclusionList Flag para limpar filtro de exclusão baseado em lista.
     */
    protected clearFilters(search: boolean, exclusionList: boolean) {

        let outerSearch: boolean = false;

        if (search && ((this.sourceType === "FETCHER" && !this.searchOnFetcher)) ||
            this.sourceType === "PAGINATED_FETCHER") {

            const searchValue: string = this.searchControl.value;

            if (searchValue != null && searchValue.length > 0) {

                this.hasGeneratedItems = false;
                this.selectItems = [];
                this.totalPages = 1;
                this.currentPage = 1;
                this.totalItems = 0;

                this.searchControl.setValue(null, {emitEvent: false});
            }

            outerSearch = true;
        }
        else {
            this.searchControl.setValue(null, {emitEvent: false});
            this.totalItems = this.selectItems.length - 1; // excluir item "nulo" da contagem de total de items
        }

        for (let selectItem of this.selectItems) {

            if (search && !outerSearch) {
                selectItem.hidden = false;
            }

            if (exclusionList) {
                selectItem.disabled = false;
            }
        }
    }

    /**
     * Verificar se um item se encontra detro da pesquisa por regex.
     * @param selectItem O item a ser verificado.
     * @return True se se encontra. False se não se encontra.
     */
    protected isInSearch(selectItem: SelectItem<T>): boolean {

        if (this.searchRegex.test(selectItem.description)) {
            return true;
        }

        const normalizedDescription: string = normalizeSync(selectItem.description).trim().toLowerCase();
        return this.searchRegex.test(normalizedDescription);
    }

    /**
     * Verificar se um item está filtrado baseado em lista de esclusão.
     * @param value O valor a ser verificado.
     * @return True se está filtrado (excluído) false caso contrário.
     */
    protected isInExclusionList(value: T): boolean {

        if (this.exclusionList == null) {
            return false;
        }

        for (let excludeItem of this.exclusionList) {

            if (this.isValueEquals(value, excludeItem)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verificar se dois valores de modelo são iguais. Se definido {@link key} usará o valor da
     * propriedade na comparação, senão tenta usar método "equals" definido no objeto, senão compara
     * apenas o valor/referência (primitivo/objeto).
     * @param valueOne O valor 1 a ser comparado.
     * @param valueTwo O valor 2 a ser comparado.
     * @return boolean True se iguais, false se diferentes.
     */
    protected isValueEquals(valueOne: T, valueTwo: T): boolean {

        if ((valueOne instanceof Object) && (valueTwo instanceof Object)) {

            // se foi definido chave de comparação
            if (this.key != null) {

                const valueOneProp: any = Reflect.get(valueOne as Object, this.key);
                const valueTwoProp: any = Reflect.get(valueTwo as Object, this.key);

                return valueOneProp === valueTwoProp;
            }
            //se possuir método equals
            else if (Reflect.has(valueOne as Object, "equals") &&
                Reflect.has(valueTwo as Object, "equals")) {
                return (valueOne as any).equals(valueTwo);
            }
        }

        // comparação padrão
        return valueOne === valueTwo;
    }
    //#endregion
}
