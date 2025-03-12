import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x0205448b1f48384fa62ef7975260d6eb72d3e928"; // Remix에서 배포한 주소로 변경
const ABI = [
  {
    inputs: [],
    name: "placeBet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "won", type: "bool" }],
    name: "endRace",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

export const connectWallet = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    const ethereum = window.ethereum as EthereumProvider;

    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const accounts = await provider.send("eth_requestAccounts", []); // 🚀 지갑 연결 요청
      if (accounts.length === 0) {
        alert("Metamask 계정을 찾을 수 없습니다.");
        return null;
      }
      console.log("Metamask 연결 성공:", accounts[0]); // ✅ 연결된 지갑 주소 출력
      return provider.getSigner();
    } catch (error) {
      console.error("지갑 연결 실패:", error);
      return null;
    }
  } else {
    alert("Metamask를 설치해주세요!");
  }
  return null;
};

export const placeBet = async (betAmount: string) => {
  const signer = await connectWallet();
  if (!signer) {
    alert("Metamask 연결 실패! 다시 시도해주세요.");
    return false;
  }

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  try {
    console.log(`배팅 진행: ${betAmount} GWei`);
    const tx = await contract.placeBet({
      value: ethers.parseUnits(betAmount, "gwei"),
    });
    console.log("트랜잭션 전송 성공:", tx.hash);
    await tx.wait();
    console.log("트랜잭션 완료!");
    return true;
  } catch (error) {
    console.error("배팅 실패:", error);
    return false;
  }
};

export const checkWin = async (winnerIndex: number, selectedIndex: number) => {
  console.log("checkWin 실행됨", { winnerIndex, selectedIndex });

  const signer = await connectWallet();
  if (!signer) return;

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  try {
    const won = selectedIndex === winnerIndex; // 🏆 사용자가 맞췄는지 확인
    const tx = await contract.endRace(won); // 컨트랙트에 결과 전송
    await tx.wait();
  } catch (error) {
    console.error("결과 확인 실패:", error);
  }
};
