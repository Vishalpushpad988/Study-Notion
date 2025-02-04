const category = require("../models/Category");
function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

//create Category handler function
exports.createCategory = async (req,res)=>{
    try {
        //fetch data
        const {name,description} = req.body;

        //validation
        if(!name || !description){
            return res.status(400).json({
                success : false,
                message:"All files are required",
            });
        }
        //create Entry in DB
        const CategoryDetails = await category.create({
            name:name,
            description:description,
        });
        // console.log(CategoryDetails);

        //return response

        return res.status(200).json({
            success:true,
            message:"Categorys created Successfully",
        });


    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Error in creating tags",
        });
    }
}

//getAllCategory handler function
exports.showAllCategory = async (req,res)=>{
    try{
        const allCategory = await category.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            message:"All category returned Successfully",
            allCategory,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

//categoryPageDetails
exports.categoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body
  
      // Get courses for the specified category
      const selectedCategory = await category.findById(categoryId)
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()
     
      // console.log("SELECTED COURSE", selectedCategory)
      // Handle the case when the category is not found
      if (!selectedCategory) {
        // console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      // Handle the case when there are no courses
      if (selectedCategory.course.length === 0) {
        // console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }
  
      // Get courses for other categories
      const categoriesExceptSelected = await category.find({
        _id: { $ne: categoryId },
      })
      let differentCategory = await category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "course",
        
          match: { status: "Published" },
        })
        .exec()
      // console.log()
      // Get top-selling courses across all categories
      const allCategories = await category.find().populate(
        {
        path:"course",
        match:{status:"Published"},
        populate:([{path:"instructor"},
        {path:"ratingAndReviews"}])}).exec()
      const allCourses = allCategories.flatMap((category) => category.course)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)

      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }
