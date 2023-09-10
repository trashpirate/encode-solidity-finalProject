import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import style from "./bettingCard.module.css";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface PoolProps {
  prizePool: number | null;
  ratioUp: number | null;
  ratioDown: number | null;
}

export default function BettingCard({ prizePool, ratioUp, ratioDown }: PoolProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [initialPrice, setInitialPrice] = useState<number | null>(null);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}`);

    socket.on("connect", function () {
      console.log("Connected");
      socket.emit("events", { test: "test" });
      socket.emit("identity", 0, (response: any) => console.log("Identity:", response));
    });

    socket.on("events", function (data) {
      console.log("current", data.currentPrice);
      console.log("initial", data.initialPrice);
      setInitialPrice(data.initialPrice);
      data.status == false ? setCurrentPrice(data.endPrice) : setCurrentPrice(data.currentPrice);
    });

    // Listen for the "bettingStarted" event
    socket.on("bettingStarted", () => {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/get-round`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setInitialPrice(data.initialPrice);
          data.status == false
            ? setCurrentPrice(data.endPrice)
            : setCurrentPrice(data.currentPrice);
        });
    });

    // Listen for the "bettingStarted" event
    socket.on("bettingEnded", () => {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/get-round`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setInitialPrice(data.initialPrice);
          data.status == false
            ? setCurrentPrice(data.endPrice)
            : setCurrentPrice(data.currentPrice);
        });
    });

    // Handle exception
    socket.on("exception", function (data) {
      console.log("event", data);
      setInitialPrice(null);
      setCurrentPrice(null);
    });

    // Handle disconnection
    socket.on("disconnect", function () {
      console.log("Disconnected");
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [initialPrice, currentPrice]);

  const priceDiff =
    currentPrice != null && initialPrice != null ? currentPrice - initialPrice : null;

  // define dynamic design functions
  const getSmallArrow = (priceDiff: number | null) => {
    if (priceDiff != null && priceDiff > 0) {
      return <FaArrowUp style={{ transform: `translate(0, 3px)` }} />;
    } else if (priceDiff != null && priceDiff < 0) {
      return <FaArrowDown style={{ transform: `translate(0, 3px)` }} />;
    } else {
      return <FaArrowUp style={{ transform: `translate(0, 3px)`, color: `transparent` }} />;
    }
  };

  const getPriceDiffStyle = () => {
    if (priceDiff != null && priceDiff > 0) {
      return {
        background: `rgb(14, 207, 143)`,
      };
    } else if (priceDiff != null && priceDiff < 0) {
      return {
        background: `rgb(240, 31, 94)`,
      };
    } else {
      return {
        background: `#ddd`,
      };
    }
  };

  const getArrowUpStyle = () => {
    if (currentPrice != null && initialPrice != null) {
      if (currentPrice > initialPrice) {
        return {
          background: `rgb(14, 207, 143)`,
          color: `white`,
        };
      } else {
        return {
          background: `#fff5`,
          color: `rgb(14, 207, 143)`,
        };
      }
    } else {
      return {
        background: `#fff5`,
        color: `rgb(14, 207, 143)`,
      };
    }
  };

  const getArrowDownStyle = () => {
    if (currentPrice != null && initialPrice != null) {
      if (currentPrice < initialPrice) {
        return {
          background: `rgb(240, 31, 94)`,
          color: `white`,
        };
      } else {
        return {
          background: `#fff5`,
          color: `rgb(240, 31, 94)`,
        };
      }
    } else {
      return {
        background: `#fff5`,
        color: `rgb(240, 31, 94)`,
      };
    }
  };

  const getPriceColorStyle = () => {
    if (currentPrice != null && initialPrice != null) {
      if (currentPrice > initialPrice) {
        return { color: "rgb(14, 207, 143)" };
      } else if (currentPrice === initialPrice) {
        return { color: "black" };
      } else {
        return { color: "rgb(240, 31, 94)" };
      }
    } else {
      return { color: "black" };
    }
  };

  // return component
  return (
    <div className={style.container}>
      <div className={style.container_card}>
        <div className={style.arrow_up} style={getArrowUpStyle()}>
          <div className={style.text_up}>
            <h3>UP</h3>
            {typeof ratioUp === "number" && ratioUp > 0 ? (
              <div>{`${ratioUp?.toFixed(1)}x Payout`}</div>
            ) : (
              <div>1x Payout</div>
            )}
          </div>
        </div>
        <div className={style.container_price}>
          <div className={style.current_price_container}>
            <p>Current LICK Price</p>
            <div className={style.current_price_inner}>
              <div className={style.current_price} style={getPriceColorStyle()}>
                {currentPrice !== null ? <h3>${currentPrice.toFixed(8)}</h3> : <p>----</p>}
              </div>
              <div className={style.price_diff} style={getPriceDiffStyle()}>
                {priceDiff !== null ? (
                  <div>
                    {getSmallArrow(priceDiff)}
                    {`  $${priceDiff.toFixed(8)}`}
                  </div>
                ) : (
                  <div>
                    {getSmallArrow(priceDiff)}
                    {`\t$ ---`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {initialPrice !== null ? (
            <div className={style.initial_price}>
              <div>Locked LICK Price:</div>
              <div>${initialPrice.toFixed(8)}</div>
            </div>
          ) : (
            <p>Locked Price: ---</p>
          )}
          {prizePool !== null ? (
            <div className={style.prizepool}>
              <div>Prize Pool:</div>
              <div>
                {prizePool}
                {` LICK`}
              </div>
            </div>
          ) : (
            <div>Prize Pool: ---</div>
          )}
        </div>
        <div className={style.arrow_down} style={getArrowDownStyle()}>
          <div className={style.text_down}>
            {typeof ratioDown === "number" && ratioDown > 0 ? (
              <div>{`${ratioDown?.toFixed(1)}x Payout`}</div>
            ) : (
              <div>1x Payout</div>
            )}
            <h3>DOWN</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
