import { ngettext, msgid } from 'ttag';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { TRANSACTION_TYPE } from '../../../const';

const TransactionTypeSelection = ({ transactionType, setTransactionType, plural = false }) => {
  const numberOfItems = plural ? 5 : 1;
  return (
    <div className="transaction-type-selection">
      <EOBButton
        text={ngettext(msgid`Order`, `Orders`, numberOfItems)}
        className={transactionType === TRANSACTION_TYPE.ORDER ? 'selected' : ''}
        onClick={() => setTransactionType(TRANSACTION_TYPE.ORDER)}
      />
      <EOBButton
        text={ngettext(msgid`Subscription`, `Subscriptions`, numberOfItems)}
        className={transactionType === TRANSACTION_TYPE.SUBSCRIPTION ? 'selected' : ''}
        onClick={() => setTransactionType(TRANSACTION_TYPE.SUBSCRIPTION)}
      />
    </div>
  );
};

export default TransactionTypeSelection;
