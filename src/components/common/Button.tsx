import styles from "./button.module.scss";

interface IProps {
  text: string;
  name?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button = ({ text, name, onClick }: IProps) => {
  return (
    <button type="button" name={name} onClick={onClick} className={styles.btn}>
      {text}
    </button>
  );
};

export default Button;
