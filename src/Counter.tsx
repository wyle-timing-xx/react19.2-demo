function Counter({ value }: { value: number }) {
  console.log('Rendering Counter'); // 仅在 value 变化时渲染
  return <div>{value}</div>;
}

export default Counter;
