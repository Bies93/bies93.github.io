export interface ControlButtonRefs {
  button: HTMLButtonElement;
  icon: HTMLImageElement;
  label: HTMLSpanElement;
}

export interface UIControlGroupRefs {
  controls: {
    mute: ControlButtonRefs;
    export: ControlButtonRefs;
    import: ControlButtonRefs;
    reset: ControlButtonRefs;
  };
}
