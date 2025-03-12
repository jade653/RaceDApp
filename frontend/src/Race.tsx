import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { placeBet, checkWin } from "./utils/web3"; // 웹3 함수 임포트

const players = ["🫏", "🐇", "🐢", "🦌", "🕊️"];

const RaceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 800px;
  height: 500px;
  background-color: #d4ed91; /* 연두색 배경 */
  border: 5px solid #a6ce39;
  border-radius: 20px;
  padding: 20px;
  overflow: hidden;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #3e721d;
  position: absolute;
  top: 1px; /* 항상 위쪽에 고정 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 10; /* 다른 요소 위에 위치 */
  padding: 10px 20px;
  border-radius: 10px;
  white-space: nowrap; /* 🔥 줄바꿈 방지 */
  text-align: center;
  width: fit-content; /* 🔥 텍스트 크기에 맞게 너비 설정 */
`;

const FinishLine = styled.div`
  position: absolute;
  left: 50px; /* 결승선 위치 */
  top: 50px;
  bottom: 50px;
  width: 10px;
  background-color: white;
`;

const moveLeft = (duration: number) => keyframes`
  from {
    transform: translateX(-100px); /* ✅ 시작 위치 */
  }
  to {
    transform: translateX(-850px); /* ✅ 결승선 위치 */
  }
`;

const PlayerRow = styled.div<{ duration: number }>`
  display: flex;
  align-items: center;
  font-size: 70px; /* 🔥 이모지 크기 */
  gap: 15px;
  position: absolute;
  right: -100px; /* ✅ 출발 위치를 RaceContainer 바깥에서 시작 */
  animation: ${({ duration }) => moveLeft(duration)}
    ${({ duration }) => duration}s ease-out forwards;
  animation-fill-mode: forwards;
`;

const Button = styled.button`
  padding: 12px 25px;
  background: #ffa500;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.3s;
  &:hover {
    background: #ff8700;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  font-size: 22px;
  color: #333;
`;

const StyledRadio = styled.input.attrs({ type: "radio" })`
  appearance: none;
  width: 24px;
  height: 24px;
  border: 3px solid limegreen; /* ✅ 라임색 테두리 */
  border-radius: 50%;
  display: inline-block;
  position: relative;
  cursor: pointer;
  background: white;
  transition: all 0.2s ease-in-out;

  &:checked {
    background: limegreen;
    box-shadow: 0 0 5px rgba(50, 205, 50, 0.6);
  }

  &:hover {
    border-color: #3e721d;
  }
`;

const StyledInput = styled.input`
  padding: 12px;
  font-size: 22px;
  text-align: center;
  border-radius: 8px;
  border: 3px solid #a6ce39;
  background: #fff8dc; /* ✅ 밝은 크림색 */
  color: black; /* ✅ 기본 글자색을 검정으로 설정 */
  outline: none;
  transition: all 0.3s ease-in-out;

  &:focus {
    border-color: orange;
    background: #ffcc80; /* ✅ 연한 주황색 강조 */
    color: black; /* ✅ 글자색 유지 */
  }
`;

const Race = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<string>("");
  const [winner, setWinner] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [raceStarted, setRaceStarted] = useState<boolean>(false);
  const [durations, setDurations] = useState<number[]>([]);

  useEffect(() => {
    if (!raceStarted) {
      setDurations([]);
    }
  }, [raceStarted]);

  // 공동 1등 방지를 위해 중복되지 않는 랜덤 시간 생성
  const generateUniqueDurations = () => {
    const availableTimes = [3, 4, 5, 6, 7]; // 3~7초 범위
    return availableTimes
      .sort(() => Math.random() - 0.5)
      .slice(0, players.length);
  };

  const startRace = async () => {
    if (selected === null || !betAmount || Number(betAmount) <= 0) {
      alert("배팅 금액을 제대로 적어주세요.");
      return;
    }

    const success = await placeBet(betAmount);
    if (!success) {
      alert("배팅 실패! 다시 시도해주세요.");
      return;
    }

    setRaceStarted(true);

    const randomDurations = generateUniqueDurations();
    setDurations(randomDurations);
    setRaceStarted(true);

    const minTime = Math.min(...randomDurations);

    setTimeout(() => {
      const winningIndex = randomDurations.indexOf(minTime);
      setWinner(winningIndex);
      setShowModal(true);

      checkWin(winningIndex, selected);
    }, minTime * 1000 + 500); // 🏁 도착 후 0.5초 뒤 모달 등장!
  };

  const resetGame = () => {
    setRaceStarted(false);
    setSelected(null);
    setBetAmount("");
    setWinner(null);
    setShowModal(false);
  };

  return (
    <RaceContainer>
      <Title>🏁 운동회 경주! 누가 우승할까요? 🏆</Title>
      <FinishLine />

      {raceStarted &&
        players.map((player, index) => (
          <PlayerRow
            key={index}
            duration={durations[index]}
            style={{ top: `${index * 80 + 50}px` }}
          >
            {player}
          </PlayerRow>
        ))}

      {!raceStarted && (
        <>
          {players.map((player, index) => (
            <div
              key={index}
              style={{
                fontSize: "28px",
                margin: "5px 0",
                display: "flex",
                alignItems: "center",
              }}
            >
              {player}
              <StyledRadio
                checked={selected === index}
                onChange={() => setSelected(index)}
                style={{ marginLeft: "10px" }}
              />
            </div>
          ))}
          <StyledInput
            type="number"
            placeholder="얼마나 응원할까? (GWei)"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
          />
          <Button onClick={startRace}>응원하기</Button>
        </>
      )}

      {showModal && (
        <Modal>
          <p>
            {winner === selected ? (
              <>
                🎉 와~! 내 친구가 우승했다~~ 🎉
                <br />
                🏆 <strong>{2 * Number(betAmount)} GWei</strong>를 받았어요!
              </>
            ) : (
              "😢 힘내! 다음에는 우승할 수 있을거야!"
            )}
          </p>
          <Button onClick={resetGame}>다시 응원하기</Button>
        </Modal>
      )}
    </RaceContainer>
  );
};

export default Race;
