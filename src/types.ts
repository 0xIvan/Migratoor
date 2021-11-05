export interface TabContext {
  state: Record<string, any>;
  setState: (props: any) => void;
}
export interface Tab {
  value: string;
  label: string;
  component: JSX.Element;
}
