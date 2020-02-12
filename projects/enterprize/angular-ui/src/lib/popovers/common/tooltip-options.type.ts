import { Placement } from "./placements.type";
import { ITooltip } from "./tooltip.interface";

/**
 * Opções para configuração de tooltip
 *
 * @author Giancarlo Dalle Mole
 * @since 06/06/2019
 */
export type TooltipOptions = ITooltip & {placement?: Placement, margin?: number, container?: "body"|null}
