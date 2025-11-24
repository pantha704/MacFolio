import { useWindowStore } from "#store/useWindowStore";

const WindowManager = () => {
  const { windows } = useWindowStore();

  return (
    <>
      {Object.entries(windows).map(([key, window]) => {
        if (!window.isOpen) return null;

        return (
          <div
            key={key}
            style={{
              position: "absolute",
              top: "100px",
              left: "100px",
              width: "400px",
              height: "300px",
              backgroundColor: "white",
              border: "1px solid black",
              zIndex: window.zIndex,
            }}
          >
            <h1>{key}</h1>
            <p>Window Content Placeholder</p>
          </div>
        );
      })}
    </>
  );
};

export default WindowManager;
