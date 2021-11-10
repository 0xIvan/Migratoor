import clsx from "clsx";

interface Props {
  header: string;
  className?: string;
}

export const Card: React.FC<Props> = (props) => {
  return (
    <div
      className={clsx(
        props.className,
        "overflow-hidden text-center rounded-md shadow-md"
      )}
      style={{ width: 500 }}
    >
      {props.header && (
        <div className="px-5 py-3 bg-gray-100">
          <h5 className="text-xl font-semibold">{props.header}</h5>
        </div>
      )}
      {props.children}
    </div>
  );
};
