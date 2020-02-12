/**
 * Item do componente de seleção etz-select (@link SelectComponent).
 *
 * @author Giancarlo Dalle Mole
 * @since 22/04/2019
 */
export class SelectItem<T> {

    /**
     * Valor do controle.
     */
    public readonly value: T;
    /**
     * Descrição apresentada para usuário.
     * @default String({@link item})
     */
    public readonly description: string;
    /**
     * Flag que indica que o item não deve ser apresentado na lista. Usado pricipalmente em filtros
     * de busca por palavra em listagens estática.
     * @default false
     */
    public hidden: boolean;
    /**
     * Flag que indica que o item não é passível de seleção. Usado principalmente em filtros de lista
     * de exclusão.
     * @default false
     */
    public disabled: boolean;
    /**
     * Flag que indica que o item está selecionado
     * @default false
     */
    public selected: boolean;

    constructor(value: T, description: string = String(value),
                excluded: boolean = false, disabled: boolean = false, selected: boolean = false) {

        this.value= value;
        this.description = description;
        this.hidden = excluded;
        this.disabled = disabled;
        this.selected = selected;
    }
}
