// Store.js

import React, { useEffect, useCallback } from "react";
import "./store.css";
import coin_symbol from "../../assets/icons/coin_symbol.png";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { handleKeyDown, setFocusedZone, setStoreItemsCount, FOCUS_ZONES } from "../../redux/slices/focusSlice";
import SlotMachine from "../../components/SlotMachine/SlotMachine"

const StoreItemCard = ({ item, isFocused }) => {
  return (
    <Link
      to={item.link}
      className={`store-item-card ${isFocused ? "focused" : ""}`}
      aria-current={isFocused ? "true" : "false"}
      tabIndex={isFocused ? 0 : -1}
    >
      <img src={coin_symbol} alt={item.name} className="item-image" />
      <h2 className="item-quantity">{item.name}</h2>
      <p className="item-price">{item.price.toLocaleString()} $</p>
    </Link>
  );
};

const Store = ({ email, username }) => {
  const dispatch = useDispatch();
  const storeFocusedIndex = useSelector((state) => state.focus.storeFocusedIndex);
  const focusedZone = useSelector((state) => state.focus.focusedZone);
  const currentRoute = useSelector((state) => state.focus.currentRoute);

  const items = [
    {
      id: 1,
      name: "50,000 CR",
      price: 1.99,
      link: `https://buy.stripe.com/test_28o6qIfJ19EJ4JW6oB?prefilled_email=${email}`
    },
    {
      id: 2,
      name: "100,000 CR",
      price: 3.99,
      link: `https://buy.stripe.com/test_cN28yQdAT8AF90c14i?prefilled_email=${email}`
    },
    {
      id: 3,
      name: "200,000 CR",
      price: 6.99,
      link: `https://buy.stripe.com/test_6oEaGYfJ14kp7W8aET?prefilled_email=${email}`
    },
    {
      id: 4,
      name: "300,000 CR",
      price: 10.99,
      link: `https://buy.stripe.com/test_eVa3ewcwP3gl3FS3cs?prefilled_email=${email}`
    },
    {
      id: 5,
      name: "500,000 CR",
      price: 15.99,
      link: `https://buy.stripe.com/test_bIY8yQ1Sb2chfoAeVb?prefilled_email=${email}`
    },
    {
      id: 6,
      name: "1,000,000 CR",
      price: 25.99,
      link: `https://buy.stripe.com/test_00gdTaaoHg3790c5kC?prefilled_email=${email}`
    }
  ];

  useEffect(() => {
    dispatch(setStoreItemsCount(items.length));
    dispatch(setFocusedZone(FOCUS_ZONES.STORE));
  }, [dispatch, items.length]);

  const onKeyDown = useCallback(
    (e) => {
      const { key } = e;
      if (focusedZone === FOCUS_ZONES.STORE && currentRoute === "/store") {
        if (key === "ArrowRight") {
          if (storeFocusedIndex < items.length - 1) {
            dispatch(handleKeyDown("ArrowRight"));
          }
        } else if (key === "ArrowLeft") {
          if (storeFocusedIndex > 0) {
            dispatch(handleKeyDown("ArrowLeft"));
          }
        } else {
          dispatch(handleKeyDown(key));
        }
        e.preventDefault();
      }
    },
    [dispatch, focusedZone, storeFocusedIndex, currentRoute]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  useEffect(() => {
    const handleEnter = (e) => {
      if (e.key === "Enter" && focusedZone === FOCUS_ZONES.STORE && currentRoute === "/store") {
        const focusedItem = items[storeFocusedIndex];
        if (focusedItem) {
          window.location.href = focusedItem.link;
        }
      }
    };
    window.addEventListener("keydown", handleEnter);
    return () => {
      window.removeEventListener("keydown", handleEnter);
    };
  }, [storeFocusedIndex, items, focusedZone, currentRoute]);

  return (
    <div>
      <SlotMachine username={username} />
      <section className="store-container">
        {items.map((item, index) => (
          <StoreItemCard
            key={item.id}
            item={item}
            isFocused={focusedZone === FOCUS_ZONES.STORE && storeFocusedIndex === index}
          />
        ))}
      </section>
    </div>
  );
};

export default Store;