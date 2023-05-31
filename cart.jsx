// simulate getting products from DataBase
const products = [
  { name: "Apples", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];

//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  //console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } =
    ReactBootstrap;
  const [productsSold, setProductsSold] = React.useState([]);
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(query, {
    data: [],
  });
  useEffect(() => {
    if (data.length > 0) {
      let tempProducts = [];
      data.map((item) => {
        tempProducts.push(item.attributes);
      });
      setItems(tempProducts);
    }
  }, [data]);

  // console.log("Products / data: ", data);
  // console.log("Items, starts as products then...", items);

  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    if (item[0].instock == 0) {
      //handles when item is out of stock
      window.alert(
        `Oops !?, The ${item[0].name} item is out of stock!, check back later`
      );
      console.log(`${item[0].name} is out of stock!`);
      return;
    }
    item[0].instock--;
    //console.log(`${item[0].name} added to Cart, amount inStock is now: ${item[0].instock}`);
    //console.log("Items after adding to cart", items);
    setItems([...items]);
    setCart([...cart, ...item]);
    //doFetch(query);
  };
  const deleteCartItem = (index) => {
    let tempitems = [...items];
    let item = cart[index];
    tempitems.map((item2Remove) => {
      item2Remove.name == item.name ? item2Remove.instock++ : null;
    });

    setItems([...tempitems]);

    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
  };

  //const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];
  //console.log("Items before map", items);
  let list = items.map((item, index) => {
    let n = index + 1049;
    let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      // the product list from which to select items to add to cart
      <li key={index}>
        <Image src={url} width={70} roundedCircle></Image>
        <Button
          variant="primary"
          size="large"
          name={item.name}
          onClick={addToCart}
        >
          Items in Stock: {item.instock} - {item.name}: ${item.cost} / ea
        </Button>
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      //expanding item list in the cart
      <Accordion.Item key={1 + index} eventkey={1 + index}>
        <Accordion.Header>{item.name}</Accordion.Header>
        <Accordion.Body
          onClick={() => deleteCartItem(index)}
          eventkey={1 + index}
        >
          $ {item.cost} from {item.country}
        </Accordion.Body>
      </Accordion.Item>
    );
  });

  let finalList = () => {
    //Sums the total cost of the cart
    let total = 0;
    let costs = cart.map((item) => (total = total + item.cost));
    // returns the final items
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name} - ${item.cost}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    // adds cart to productsSold, clears cart
    if (cart.length == 0) {
      //handles when cart is empty
      window.alert("Opps!, looks like you forgot to add items to your cart");
      return;
    }

    console.log("productsSold before checkout: ", productsSold);

    let tempProductsSold = [...productsSold];
    cart.map((cartItem) => {      
        tempProductsSold.push({
          name: cartItem.name,
          country: cartItem.country,
          cost: cartItem.cost,
          sold: 1,
          transactID: Math.floor(Math.random() * 100000),
        });
    });
    console.log("tempProductsSold after checkout: ", tempProductsSold);
    setProductsSold([...tempProductsSold]);
    setCart([]);
  };

  const restockProducts = (url) => {
    // get fetched data from url
    doFetch(url);
    console.log("data in restock: ", data);
    // use the instock to update the products instock values
    // like sending a new batch of products to the store
    let restockBatch = [];
    data.map((item) => {
      restockBatch.push(item.attributes);
    });
    items.map((item) => {
      restockBatch.map((restockItem) => {
        if (item.name == restockItem.name) {
          item.instock += restockItem.instock;
        }
      });
    });
    setItems([...items]);
    window.alert("Products have been restocked");
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion defaultActiveKey="0">{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(query);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
