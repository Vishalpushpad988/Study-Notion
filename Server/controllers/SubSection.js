// Import necessary modules
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
  try {
    // fetch data
    const {
      sectionId,
      title,
      description,
      //  timeDuration
    } = req.body;

    // fetch file
    const video = req.files.video;

    // validate
    if (
      !title ||
      !description ||
      !sectionId ||
      !video
      // || !timeDuration
    ) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }

    // upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    // create subSection
    const newSubSection = await SubSection.create({
      title: title,
      description: description,
      videoUrl: uploadDetails.secure_url,
      timeDuration: `${uploadDetails.duration}`,
    });

    // update section with sub section objectId
    const updateSubSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { SubSection: newSubSection._id } },
      { new: true }
    ).populate({
      path: "SubSection",
    });
    // console.log("Here is the updated SUbsection********* ", updateSubSection);

    // return success response
    return res.status(201).json({
      success: true,
      message: "sub section created successfully",
      data: updateSubSection,
    });
  } catch (error) {
    // Handle any errors that may occur during the process
    // console.error("Error creating new sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body;
    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();
    // console.log("IDR TKK SB THIK HAI")
    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "SubSection"
    );

    // console.log("updated section----->", updatedSection);

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    // validate
    if (!subSectionId || !sectionId) {
      return res.status(404).json({
        success: false,
        message: "all fields are required",
      });
    }

    const deletedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
          $pull: {
              SubSection: subSectionId
          }
      }
    )
    const deleteSubSection = await SubSection.findByIdAndDelete(subSectionId)

    if (!deleteSubSection) {
      return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
  }


    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "SubSection"
    );

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
};
