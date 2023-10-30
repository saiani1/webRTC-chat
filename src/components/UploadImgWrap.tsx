import styles from "./uploadImgWrap.module.scss";

interface IProps {
  src: string;
  setDelImgBtn: (newValue: string) => void;
}

const UploadImgWrap = ({ src, setDelImgBtn }: IProps) => {
  const handleClickDelBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.target as HTMLButtonElement;
    setDelImgBtn(value.name);
    console.log(value.name);
  };

  return (
    <div className={styles.wrap}>
      <img src={src} />
      <button type="button" name={src} onClick={handleClickDelBtn}>
        X
      </button>
    </div>
  );
};

export default UploadImgWrap;
