import * as React from 'react';
import { Avatar } from '../ui/avatar/Avatar';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import * as styles from './wallet.styl';


export const WalletItem = ({className='', onSelect=null, account=null, active=false, balance=null, children=[], ...props}) => {

    className = cn(styles.wallet, className, {[styles.activeWallet]: active});

    const iconClass = cn(
        styles.accountIcon,
        {
            'active-account-icon': active,
            'inactive-account-icon': !active,
            [styles.inactive]: !active,
        });

    const clickHandler = () => {
        if (onSelect) {
            onSelect(account);
        }
    };

    return <div className={className} {...props} onClick={clickHandler}>
        <div>
            <Avatar size={48} address={account.address}/>
        </div>
        <div>
            <div>
                {account.name}
            </div>
            <div className={styles.balance}>
                {balance} Waves
            </div>
        </div>
        <div>
            {children}
            <div className={iconClass}></div>
        </div>
    </div>;

};
