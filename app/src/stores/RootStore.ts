import { UIStore, JSONModel } from '@vzh/mobx-stores';
import AppStore from './AppStore';
import SignInStore from './SignInStore';
import DashboardStore from './DashboardStore';

export default class RootStore {
  readonly appStore: AppStore;

  readonly signInStore: SignInStore;

  readonly dashboardStore: DashboardStore;

  constructor(initialState: Partial<JSONModel<RootStore>> = {}) {
    console.log('initialState', initialState);

    this.appStore = new AppStore(this, new UIStore(this), initialState.appStore);

    this.signInStore = new SignInStore(this, new UIStore(this), initialState.signInStore);

    this.dashboardStore = new DashboardStore(this, new UIStore(this), initialState.dashboardStore);
  }
}