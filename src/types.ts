export interface TabContext {
  state: Record<string, any>;
  updateState: (props: any) => void;
}
export interface Tab {
  label: string;
  component: JSX.Element;
}
