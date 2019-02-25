import { ACTION } from '../actions/constants';
import { config } from '@waves/signature-generator';
import background from '../services/Background';
import { i18n } from '../i18n';
import {
    setTab,
    updateAsset,
    notificationDelete,
    notificationSelect,
    notificationChangeName,
    pairingLoading,
    pairingSetData, updateActiveMessage,
} from '../actions';
import { PAGES } from '../pageConfig';

export const pairingData = store => next => action => {
    if (action.type !== ACTION.PAIRING.GET_SEED) {
        return next(action);
    }
    
    store.dispatch(pairingLoading(true));
    background.exportSeed(action.payload).then(
        (data) => {
            store.dispatch(pairingSetData(data));
            store.dispatch(pairingLoading(false));
        },
        () => {
            store.dispatch(pairingSetData(null));
            store.dispatch(pairingLoading(false));
        }
    )
};

export const changeLang = store => next => action => {
    if (action.type === ACTION.CHANGE_LNG && action.payload !== store.getState().currentLocale) {
        background.setCurrentLocale(action.payload);
    }
    return next(action);
};

export const updateLang = store => next => action => {
    if (action.type === ACTION.UPDATE_FROM_LNG && action.payload !== store.getState().currentLocale) {
        i18n.changeLanguage(action.payload);
    }
    return next(action);
};

export const selectAccount = store => next => action => {
    if (action.type === ACTION.SELECT_ACCOUNT && store.getState().selectedAccount.address !== action.payload.address) {
        background.selectAccount(action.payload.address).then(
            () => {
                store.dispatch(notificationSelect(true));
                setTimeout(() => store.dispatch(notificationSelect(false)), 1000);
            }
        );
        return null;
    }

    return next(action);
};

export const deleteActiveAccount = store => next => action => {
    if (action.type === ACTION.DELETE_ACTIVE_ACCOUNT) {
        const { selectedAccount, localState } = store.getState();
        const selected =  localState.assets.account ?  localState.assets.account.address : selectedAccount.address;
        
        background.removeWallet(selected).then(
            () => {
                store.dispatch(notificationDelete(true));
                setTimeout(() => {
                    store.dispatch(notificationDelete(false));
                    store.dispatch(setTab(PAGES.ROOT));
                }, 1000);
            }
        );
        return null;
    }

    return next(action);
};

export const closeNotificationWindow = _ => next => action => {
    if (action.type === ACTION.CLOSE_WINDOW) {
        background.closeNotificationWindow();
    }
    return next(action);
};

export const deleteAccountMw = store => next => action => {
    if (action.type === ACTION.DELETE_ACCOUNT) {
        background.deleteVault().then(
            () => {
                store.dispatch(updateActiveMessage(null));
                // store.dispatch(notificationDelete(true));
                // setTimeout(() => {
                //     store.dispatch(notificationDelete(false));
                //
                // }, 1000);
                store.dispatch(setTab(PAGES.ROOT));
            }
        );
        return null;
    }

    return next(action);
};

export const uiState = store => next => action => {
    if (action.type === ACTION.SET_UI_STATE) {
        const ui = store.getState().uiState;
        const newState = { ...ui, ...action.payload };
        background.setUiState(newState).then(
            (uiState) => {
                store.dispatch({ type: ACTION.UPDATE_UI_STATE, payload: uiState });
            }
        );
        return null;
    }

    if (action.type === ACTION.SET_UI_STATE_AND_TAB) {
        const ui = store.getState().uiState;
        const newState = { ...ui, ...action.payload.ui };
        background.setUiState(newState).then(
            (uiState) => {
                store.dispatch({ type: ACTION.UPDATE_UI_STATE, payload: uiState });
                store.dispatch(setTab(action.payload.tab));
            }
        );

        return;
    }

    return next(action);
};

export const changeNetwork = store => next => action => {
    if (action.type === ACTION.CHANGE_NETWORK) {
        background.setNetwork(action.payload).then(
            () => setTab(PAGES.ROOT)
        );
        return null;
    }

    return next(action);
};

export const getAsset = store => next => action => {
    if (action.type === ACTION.GET_ASSETS) {
        background.assetInfo(action.payload).then(
            (data) => {
                store.dispatch(updateAsset({[action.payload]: data}))
            }
        );
        return null;
    }

    return next(action);
};

export const changeName = store => next => action => {
    if (action.type === ACTION.CHANGE_ACCOUNT_NAME) {
        const { address, name } = action.payload;
        background.editWalletName(address, name).then(
            () => {
                store.dispatch(notificationChangeName(true));
                setTimeout(() => store.dispatch(notificationChangeName(false)), 1000);
            }
        );
        return null;
    }

    return next(action);
};

export const setCustomNode = store => next => action => {
    if (ACTION.CHANGE_NODE === action.type) {
        const { node, network } = action.payload;
        background.setCustomNode(node, network);
        return null;
    }

    return next(action);
};

export const setCustomMatcher = store => next => action => {
    if (ACTION.CHANGE_MATCHER === action.type) {
        const { matcher, network } = action.payload;
        background.setCustomMatcher(matcher, network);
        return null;
    }
    
    return next(action);
};

export const updateNetworkCode = store => next => action => {
    if (action.type === ACTION.UPDATE_CURRENT_NETWORK || action.type === ACTION.UPDATE_NETWORKS) {
        const { payload, type } = action;
        let { networks, currentNetwork } = store.getState();

        if (type === ACTION.UPDATE_CURRENT_NETWORK) {
            currentNetwork = payload;
        }

        if (type === ACTION.UPDATE_NETWORKS) {
            networks = payload;
        }
        
        if (currentNetwork && networks && networks.length) {
            const netCode = networks.filter(({ name }) => name === currentNetwork)[0] || networks[0];
            if (netCode) {
                config.set({networkByte: netCode.code.charCodeAt(0)});
            }
        }
    }

    next(action);
};

export const lock = store => next => action => {
    if (action.type === ACTION.LOCK) {
        background.lock();
        return null;
    }
    return next(action);
};

