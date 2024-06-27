import { useState } from 'react'
import { Inventory, Market } from './../../ethers.js'
import {Layout, Menu, Table, theme} from 'antd';
const { Content } = Layout;

const menuTokens = [];
const tokens = await Inventory.getTokens();
tokens.forEach((token) => {
    menuTokens.push({
        label: token[1],
        key: token[1],
    });
});
const menuFiats = [];
const fiats = await Inventory.getFiats();
fiats.forEach((fiat) => {
    menuFiats.push({
        label: fiat[0],
        key: fiat[0],
    });
});
const menuMethods = [];
const methods = await Inventory.getMethods();
methods.forEach((method) => {
    menuMethods.push({
        label: method[0],
        key: method[0],
    });
});

const menuSellBuy = [
    {key: "sell", label: "Sell"},
    {key: "buy", label: "Buy"}
];

let list = await Market.getOffers(true, menuTokens[0].key, menuFiats[0].key, menuMethods[0].key);
console.log(list);

const dataSource = [
    {
        key: '1',
        name: 'Mike',
        age: 32,
        address: '10 Downing Street',
    },
    {
        key: '2',
        name: 'John',
        age: 42,
        address: '10 Downing Street',
    },
];

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
    },
];

function Offers() {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const [current, setCurrent] = useState(tokens[0].key);
    const onClick = (e) => {
        setCurrent(e.key);
    };

  return (
      /*<Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['sell']}
          items={menuSellBuy}
          style={{
              flex: 1,
              minWidth: 0,
          }}
      />
    <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={[menuTokens[0].key]}
        items={menuTokens}
        style={{
            flex: 1,
            minWidth: 0,
        }}
    />
    <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={[menuFiats[0].key]}
        items={menuFiats}
        style={{
            flex: 1,
            minWidth: 0,
        }}
    />
    <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={[menuMethods[0].key]}
        items={menuMethods}
        style={{
            flex: 1,
            minWidth: 0,
        }}
    />*/
          <Content
              style={{
                  padding: '0 48px',
              }}
          >
              <div
                  style={{
                      background: colorBgContainer,
                      minHeight: 280,
                      padding: 24,
                      borderRadius: borderRadiusLG,
                  }}
              >
                  <Table dataSource={dataSource} columns={columns} />;
              </div>
          </Content>
  )
}

export default Offers
