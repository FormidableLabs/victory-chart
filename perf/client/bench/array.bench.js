suite("Array iteration", () => {
  benchmark("native forEach", () => {
    [1, 2, 3].forEach((el) => el);
  });
});
