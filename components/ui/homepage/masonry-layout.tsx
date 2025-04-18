import { generateRandomPlaceholderImages } from "@/components/placeholder/placeholder-images";
import MasonryImage from "./masonry-image";
import masonryStyle from "./masonry.module.css";

// this is a placeholder implementation for demo purposes. the use of RSC rather than client-side javascript here is debated as it's one of the few cases that client-side scripting might be preferred.
// the current implementation is a custom-made masonry grid layout that does not account for things like responsive design. the idea is good but the implementation may be revised.

interface SmallCol {
  proportion: number;
}

interface Row {
  proportion: number;
  smallCols: SmallCol[];
}

interface BigCol {
  proportion: number;
  rows: Row[];
}

interface MasonryData {
  bigCols: BigCol[];
}

const randomBetween = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

const adjustValue = (
  base: number,
  range: [number, number],
  mode: "add" | "subtract" | "symmetric" = "add"
): number => {
  const rand = randomBetween(range[0], range[1]);
  if (mode === "subtract") return base - rand;
  if (mode === "symmetric") return base + randomBetween(-rand, rand);
  return base + rand;
};

export function generateMasonry(): MasonryData {
  const numBigCols = 3;
  const specialIndex = Math.floor(Math.random() * numBigCols);
  const bigCols: BigCol[] = [];
  const baseBig = 1 / numBigCols;

  for (let i = 0; i < numBigCols; i++) {
    const offsetRange: [number, number] = [0.01, 0.1];
    const rawBigProportion =
      i === specialIndex
        ? adjustValue(baseBig, offsetRange, "subtract")
        : adjustValue(baseBig, offsetRange, "add");

    const numRows = Math.floor(Math.random() * 2) + 2;
    let rows: Row[] = [];

    if (numRows === 2) {
      const firstRowProp = randomBetween(0.3, 0.7);
      rows.push({ proportion: firstRowProp, smallCols: [] });
      rows.push({ proportion: 1 - firstRowProp, smallCols: [] });
    } else {
      const baseRow = 1 / 3;
      const rawRowProps: number[] = Array.from({ length: 3 }, () =>
        adjustValue(baseRow, [0, 0.15], "symmetric")
      );
      const totalRows = rawRowProps.reduce((acc, v) => acc + v, 0);
      rows = rawRowProps.map((v) => ({
        proportion: v / totalRows,
        smallCols: [],
      }));
    }

    rows = rows.map((row) => {
      const numSmallCols = i === specialIndex ? 1 : Math.random() < 0.5 ? 1 : 2;
      const smallCols: SmallCol[] = [];
      if (numSmallCols === 1) {
        smallCols.push({ proportion: 1 });
      } else {
        const firstSmallCol = randomBetween(0.25, 0.75);
        smallCols.push({ proportion: firstSmallCol });
        smallCols.push({ proportion: 1 - firstSmallCol });
      }
      return { ...row, smallCols };
    });

    bigCols.push({
      proportion: rawBigProportion,
      rows,
    });
  }

  const totalBig = bigCols.reduce((acc, col) => acc + col.proportion, 0);
  bigCols.forEach((col) => (col.proportion /= totalBig));

  return { bigCols };
}

export default function MasonryLayout() {
  const masonry = generateMasonry();
  const totalImages = masonry.bigCols.reduce(
    (sum, big) =>
      sum + big.rows.reduce((rowSum, row) => rowSum + row.smallCols.length, 0),
    0
  );
  const images = generateRandomPlaceholderImages(totalImages);
  let imagePtr = 0;

  const bigColTemplate = masonry.bigCols
    .map((col) => `${(col.proportion * 100).toFixed(2)}fr`)
    .join(" ");

  return (
    <div
      style={
        {
          display: "grid",
          "--masonry-big-col-template": bigColTemplate,
        } as Record<string, string>
      }
      className={`w-full h-full ${masonryStyle.bigCol}`}
    >
      {masonry.bigCols.map((bigCol, bigIndex) => {
        const rowTemplate = bigCol.rows
          .map((row) => `${(row.proportion * 100).toFixed(2)}fr`)
          .join(" ");
        return (
          <div
            key={bigIndex}
            style={{
              gridTemplateRows: rowTemplate,
              gap: "0.8rem",
            }}
          >
            {bigCol.rows.map((row, rowIndex) => {
              const smallColTemplate = row.smallCols
                .map((small) => `${(small.proportion * 100).toFixed(2)}fr`)
                .join(" ");
              return (
                <div
                  key={rowIndex}
                  style={{
                    display: "grid",
                    gridTemplateColumns: smallColTemplate,
                    gap: "0.8rem",
                  }}
                >
                  {row.smallCols.map((_, smallIndex) => {
                    const imageSrc = images[imagePtr++];
                    return <MasonryImage key={smallIndex} src={imageSrc} />;
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
