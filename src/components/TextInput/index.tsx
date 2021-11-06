interface Props {
  placeholder: string;
  onChange: (input: string) => void;
  value: string;
}

export const TextInput: React.FC<Props> = (props) => {
  const { placeholder, onChange, value } = props;

  return (
    <input
      type="text"
      placeholder={placeholder}
      className="relative w-full px-2 py-1 text-sm text-gray-600 placeholder-gray-400 bg-white border border-gray-400 rounded outline-none focus:outline-none focus:ring"
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        onChange(event.target.value)
      }
      value={value}
    />
  );
};
