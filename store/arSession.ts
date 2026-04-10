import { TECHNIQUES } from '@/constants/experiment';
import type { BlockResult, OverlayState, TechniqueId } from '@/types/experiment';

type OverlayListener = (state: OverlayState) => void;
type BlockListener = (result: BlockResult) => void;
type ConfirmHandler = () => void;

let technique: TechniqueId = 'baseline';
let overlayListener: OverlayListener | null = null;
let blockListener: BlockListener | null = null;
let confirmHandler: ConfirmHandler | null = null;

export function configureArSession(config: {
  technique: TechniqueId;
  onOverlayStateChange: OverlayListener;
  onBlockComplete: BlockListener;
}) {
  technique = config.technique;
  overlayListener = config.onOverlayStateChange;
  blockListener = config.onBlockComplete;
}

export function clearArSession() {
  overlayListener = null;
  blockListener = null;
  confirmHandler = null;
}

export function getArTechnique(): TechniqueId {
  return technique;
}

export function emitOverlayState(state: Omit<OverlayState, 'technique'>) {
  overlayListener?.({
    ...state,
    technique: TECHNIQUES[technique],
  });
}

export function emitBlockComplete(result: BlockResult) {
  blockListener?.(result);
}

export function registerConfirmHandler(handler: ConfirmHandler) {
  confirmHandler = handler;
}

export function requestManualConfirm() {
  confirmHandler?.();
}
