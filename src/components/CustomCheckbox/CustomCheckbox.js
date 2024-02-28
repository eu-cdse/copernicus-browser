import { ReactComponent as CheckMark } from '../../icons/check-mark.svg';
import './customCheckbox.scss';

const CustomCheckbox = ({ className, checked, onChange, label }) => {
  return (
    <div className={`custom-checkbox-container${className ? ` ${className}` : ''}`}>
      <label className="custom-checkbox-label">
        <input className="custom-checkbox" type="checkbox" checked={!!checked} onChange={onChange} />
        {!!checked && <CheckMark className="check-mark" />}
        <span className="custom-checkbox-text">{label}</span>
      </label>
    </div>
  );
};

export default CustomCheckbox;
