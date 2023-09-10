import React, { useState, useEffect } from "react";
import style from "./countdown.module.css";
import { io } from "socket.io-client";

export default function CountdownTimer() {
  const [bettingTime, setBettingTime] = useState<number | null>(null);
  const [initialTime, setInitialTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [endTimeString, setEndTimeString] = useState<Date | null>(null);
  const [roundID, setRoundID] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/get-round`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        data.status === false ? setEndTime(null) : setEndTime(Number(new Date(data.end)) / 1000);
        data.open === false
          ? setBettingTime(0)
          : setBettingTime(Number(new Date(data.close)) / 1000);
        setRoundID(data.id);
      });
    const currentTime = Math.floor(Date.now() / 1000);
    setInitialTime(currentTime);

    // Create a WebSocket connection to the backend
    const socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}`);

    // Listen for the "bettingStarted" event
    socket.on("bettingStarted", () => {
      console.log("Betting started");
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/get-round`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          data.status === false ? setEndTime(null) : setEndTime(Number(new Date(data.end)) / 1000);
          data.open === false
            ? setBettingTime(0)
            : setBettingTime(Number(new Date(data.close)) / 1000);
          setRoundID(data.id);
        });
      const currentTime = Math.floor(Date.now() / 1000);
      setInitialTime(currentTime);
    });

    socket.on("bettingEnded", () => {
      console.log("Betting has ended");
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/get-round`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          data.status === false ? setEndTime(null) : setEndTime(Number(new Date(data.end)) / 1000);
          data.open === false
            ? setBettingTime(0)
            : setBettingTime(Number(new Date(data.close)) / 1000);
          setRoundID(data.id);
        });
      const currentTime = Math.floor(Date.now() / 1000);
      setInitialTime(currentTime);
    });

    socket.on("roundEnded", () => {
      console.log("Round has ended");
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/get-round`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          data.status === false ? setEndTime(null) : setEndTime(Number(new Date(data.end)) / 1000);
          data.open === false
            ? setBettingTime(0)
            : setBettingTime(Number(new Date(data.close)) / 1000);
          setRoundID(data.id);
        });
      const currentTime = Math.floor(Date.now() / 1000);
      setInitialTime(currentTime);
    });

    if (endTime !== null) {
      const d = new Date(0);
      d.setUTCSeconds(endTime);
      setEndTimeString(d);
    }
    if (bettingTime !== null) {
      const intervalId = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = bettingTime - currentTime;
        setBettingTime(timeLeft > 0 ? timeLeft : 0);
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }

    // Clean up the socket connection when component unmounts
    return () => {
      socket.disconnect();
    };
  }, [initialTime, endTime]);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${hours.toString().padStart(2, "0")} hrs ${minutes
      .toString()
      .padStart(2, "0")} min ${seconds.toString().padStart(2, "0")} sec`;
  };

  return (
    <div className={style.timer_container}>
      {roundID === null ? (
        <h1>NO ROUNDS ACTIVE</h1>
      ) : (
        <div>
          <h1>{`ROUND ${roundID}`}</h1>
          {endTime === null ? (
            <div>
              <h2>Finished</h2>
            </div>
          ) : (
            <div>
              <h2>
                Round Ending:
                <br />
                {endTimeString == null ? "Not available." : endTimeString.toLocaleString()}
              </h2>
            </div>
          )}
        </div>
      )}

      {bettingTime == null ? (
        <h2 className={style.countdown}>Betting Closed</h2>
      ) : (
        <h2 className={style.countdown}>
          Betting Time Remaining: <br />
          {bettingTime == null ? "Not available" : formatTime(bettingTime)}
        </h2>
      )}
    </div>
  );
}
