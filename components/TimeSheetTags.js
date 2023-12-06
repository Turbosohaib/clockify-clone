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
      <div onClick={toggleDropDown} className="rounded-md items-center w-full">
        {trackTime.projectTag ? (
          <div className="flex w-full justify-between items-center">
            <div>{trackTime.projectTag}</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 512 512"
              id="down-arrow"
            >
              <path d="M98.9 184.7l1.8 2.1 136 156.5c4.6 5.3 11.5 8.6 19.2 8.6 7.7 0 14.6-3.4 19.2-8.6L411 187.1l2.3-2.6c1.7-2.5 2.7-5.5 2.7-8.7 0-8.7-7.4-15.8-16.6-15.8H112.6c-9.2 0-16.6 7.1-16.6 15.8 0 3.3 1.1 6.4 2.9 8.9z"></path>
            </svg>
          </div>
        ) : (
          <div className="flex w-full justify-between items-center">
            <div className="text-gray-500">Select a tag</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 512 512"
              id="down-arrow"
            >
              <path d="M98.9 184.7l1.8 2.1 136 156.5c4.6 5.3 11.5 8.6 19.2 8.6 7.7 0 14.6-3.4 19.2-8.6L411 187.1l2.3-2.6c1.7-2.5 2.7-5.5 2.7-8.7 0-8.7-7.4-15.8-16.6-15.8H112.6c-9.2 0-16.6 7.1-16.6 15.8 0 3.3 1.1 6.4 2.9 8.9z"></path>
            </svg>
          </div>
        )}
      </div>
      {isOpen && (
        <div className="absolute top-10 left-1  py-2 lg:w-[300px] w-[200px] bg-white shadow-lg z-10">
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
