import axios from "axios";
import { useState } from "react";

function Dropdown({ trackTime, setTrackTime, tags }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tag, setTag] = useState("");
  const [projectTags, setProjectTags] = useState(tags);
  const [originalProjectTags, setOriginalProjectTags] = useState(tags);

  const toggleDropDown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectOption = (value) => {
    setTrackTime({ ...trackTime, projectTag: value });
    setIsOpen(false);
  };

  const handleChange = (e) => {
    const enteredTag = e.target.value.toLowerCase();
    setTag(enteredTag);

    if (enteredTag === "") {
      // If the input is cleared, restore projectTags to the original array
      setProjectTags(originalProjectTags);
    } else {
      // Filter projectTags based on partial or case-insensitive matches
      const filteredTags = originalProjectTags.filter((projectTag) =>
        projectTag.tag.toLowerCase().includes(enteredTag)
      );
      setProjectTags(filteredTags);
    }
  };

  const handleInputBlur = () => {
    // Store the current projectTags as the original array
    setOriginalProjectTags([...projectTags]);
  };

  const createTag = (tagToCreate) => {
    // Create a new tag and add it to both projectTags and originalProjectTags
    const newTag = { tag: tagToCreate };
    setProjectTags([...projectTags, newTag]);
    setOriginalProjectTags([...originalProjectTags, newTag]);
    setTag(tagToCreate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectTag = {
      tag: tag,
    };
    try {
      const result = await axios.post("/api/addTag", { projectTag });
      console.log(result);
      setProjectTags(result.data.Tags);
      setTag("");
    } catch (err) {
      console.log(err);
    }
  };

  // const filterTags = (e) => {

  // }

  return (
    <>
      <div
        onClick={toggleDropDown}
        className="rounded-md items-center mx-auto w-fit"
      >
        {trackTime.projectTag ? (
          <div className="px-[5px] bg-sky-100 text-gray-500 text-[14px] w-full">
            <span className="mx-auto">{trackTime.projectTag}</span>
          </div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            opacity="0.5"
            className="w-6 h-6 mx-auto "
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6h.008v.008H6V6z"
            />
          </svg>
        )}
      </div>
      {isOpen && (
        <div className="absolute mt-2 py-2 lg:w-[300px] w-[200px] bg-white rounded-md shadow-lg">
          <form onSubmit={(e) => handleSubmit(e)}>
            <input
              type="text"
              value={tag}
              name="tag"
              onChange={handleChange}
              className="py-2 px-2 mx-2 my-2 lg:w-[285px] w-[185px] border bg-gray-60"
              onBlur={handleInputBlur}
              placeholder="Add/Find tags..."
              onKeyUp={(e) => {
                if (e.key === "Enter" && tag !== "") {
                  createTag(tag);
                }
              }}
            ></input>
            <button type="submit" className="hidden"></button>
          </form>
          <ul>
            {projectTags.length === 0 ? (
              <div className="px-6 items-center">
                <span className="text-md">No matching tag.</span>
                <p className="text-sm block text-gray-500">
                  Press Enter to quickly{" "}
                  <a
                    onClick={handleSubmit}
                    className="text-blue-500 hover:underline"
                  >
                    `create {tag} tag.`
                  </a>
                </p>
              </div>
            ) : (
              projectTags.map((tag, index) => {
                return (
                  <li
                    key={index}
                    data-value={tag._id}
                    onClick={() => handleSelectOption(tag.tag)}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    {tag.tag}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </>
  );
}

export default Dropdown;
