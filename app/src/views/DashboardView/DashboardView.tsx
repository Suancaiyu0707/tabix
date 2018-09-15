import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { observer } from 'mobx-react';
import { Layout, Tabs } from 'antd';
import { Flex } from 'reflexy';
import { typedInject } from '@vzh/mobx-stores';
import { ServerStructure } from 'services';
import { Stores, DashboardStore } from 'stores';
import Page from 'components/Page';
import { DBTree, TabPage } from 'components/Dashboard';
import Splitter from 'components/Splitter';
import css from './DashboardView.css';

interface InjectedProps {
  store: DashboardStore;
}

export interface Props extends InjectedProps {}

type RoutedProps = Props & RouteComponentProps<any>;

@observer
class DashboardView extends React.Component<RoutedProps> {
  componentWillMount() {
    this.load();
  }

  private load = () => {
    const { store } = this.props;
    store.loadData();
  };

  private onColumnClick = (column: ServerStructure.Column) => {
    console.log(column);
  };

  render() {
    const { store } = this.props;
    const databases = store.serverStructure.map(_ => _.databases).getOrElse([]);

    return (
      <Page column={false} uiStore={store.uiStore}>
        <Splitter>
          <Flex alignItems="stretch" vfill>
            <Layout>
              <Layout.Sider width="100%">
                {store.serverStructure
                  .map(s => (
                    <DBTree structure={s} onReload={this.load} onColumnClick={this.onColumnClick} />
                  ))
                  .orUndefined()}
              </Layout.Sider>
            </Layout>
          </Flex>

          <Tabs type="editable-card" className={css.tabs}>
            {store.tabs.map(t => (
              <Tabs.TabPane key={t.id} closable tab={t.title} className={css.tabpane}>
                <TabPage model={t} databases={databases} />
              </Tabs.TabPane>
            ))}
          </Tabs>
        </Splitter>
      </Page>
    );
  }
}

export default withRouter(
  typedInject<InjectedProps, RoutedProps, Stores>(({ store }) => ({ store: store.dashboardStore }))(
    DashboardView
  )
);