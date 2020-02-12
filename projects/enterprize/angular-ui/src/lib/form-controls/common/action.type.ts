import { SelectComponent } from "../components/select/select.component";

/**
 * Configuração de item de ação.
 *
 * @author Giancarlo Dalle Mole
 * @since 30/04/2019
 */
export type Action<T, E = any> = {

    /**
     * Descrição a ser apresentada
     */
    description?: string | null;
    /**
     * Classes de ícone a ser apresentado
     */
    icon?: string | null;
    /**
     * Flag que indica se deve fechar
     */
    close?: boolean;
    /**
     * Dados extras que podem ser usados. Disponível no template de ações.
     */
    extra?: E;
    /**
     * Listener a ser invocado na execução da ação
     * @param selectComponent Referência do componente etz-select que invocou a ação
     */
    listener(selectComponent: SelectComponent<T>): void;
}
