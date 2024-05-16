import { t } from 'ttag';
import ExternalLink from '../../../../../ExternalLink/ExternalLink';

const Credit = ({ title, link, logo }) => {
  return (
    <div>
      <ExternalLink href={link}>
        {logo ? <img src={logo} alt={title} className="tooltip-logo" /> : title}
      </ExternalLink>
    </div>
  );
};

const CreditsList = ({ credits = [], className = null }) => {
  if (!credits || credits.length === 0) {
    return null;
  }

  return (
    <div className={`tooltip-credits ${className ? className : ''}`}>
      <div>{t`Credits:`}</div>
      {credits.map(({ title, link, logo }, index) => (
        <Credit key={index} title={title} link={link} logo={logo} />
      ))}
    </div>
  );
};

export default CreditsList;
