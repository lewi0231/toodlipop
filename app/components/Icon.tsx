interface IconProps {
  filename: string;
  handleOnClick?: () => void;
  altText: string;
}

const Icon = ({ filename, handleOnClick, altText }: IconProps) => {
  return (
    <div>
      <img src={`../images/${filename}`} alt={altText} />
    </div>
  );
};

export default Icon;
