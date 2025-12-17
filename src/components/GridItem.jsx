import React, { useRef, useEffect } from 'react';

const GridItem = ({ value, onChange, className }) => {
    const editRef = useRef(null);

    useEffect(() => {
        if (editRef.current && editRef.current.innerText !== value && document.activeElement !== editRef.current) {
            editRef.current.innerText = value;
        }
    }, [value]);

    const handleClick = () => {
        if (editRef.current) {
            editRef.current.focus();
        }
    };

    return (
        <div
            className={`${className} cursor-text`}
            onClick={handleClick}
        >
            <div
                ref={editRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => onChange(e.target.innerText)}
                className="outline-none w-full text-center bg-transparent break-words whitespace-pre-wrap px-1"
            />
        </div>
    );
};

export default GridItem;
