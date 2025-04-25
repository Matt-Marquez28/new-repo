export const recommendCandidates = async (req, res) => {
  const { educationalLevels, skills, specializations, locations } = req.body;

  try {
    // Sanitize inputs to ensure they are arrays and provide defaults
    const sanitizedEducationalLevels =
      educationalLevels && educationalLevels.length > 0
        ? educationalLevels
        : [];
    const sanitizedSkills = skills && skills.length > 0 ? skills : [];
    const sanitizedSpecializations =
      specializations && specializations.length > 0 ? specializations : [];
    const sanitizedLocations = locations && locations.length > 0 ? locations : [];

    if (sanitizedSpecializations.length === 0) {
      return res
        .status(400)
        .json({ message: "Specializations are required for recommendations." });
    }

    const pipeline = [
      {
        $search: {
          index: "jobSeekerSearch",
          compound: {
            must: [
              {
                text: {
                  query: sanitizedSpecializations,
                  path: "skillsAndSpecializations.specializations",
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 2,
                  },
                  score: { boost: { value: 3 } },
                },
              },
              ...(sanitizedLocations.length > 0
                ? [
                    {
                      text: {
                        query: sanitizedLocations,
                        path: "personalInformation.cityMunicipality",
                        fuzzy: {
                          maxEdits: 1,
                          prefixLength: 2,
                        },
                        score: { boost: { value: 2 } },
                      },
                    },
                  ]
                : []),
            ],
            should: [
              ...(sanitizedSkills.length > 0
                ? [
                    {
                      text: {
                        query: sanitizedSkills,
                        path: "skillsAndSpecializations.coreSkills",
                        fuzzy: {
                          maxEdits: 1,
                          prefixLength: 2,
                        },
                        score: { boost: { value: 2 } },
                      },
                    },
                  ]
                : []),
              ...(sanitizedEducationalLevels.length > 0
                ? [
                    {
                      text: {
                        query: sanitizedEducationalLevels,
                        path: "personalInformation.educationalLevel",
                        score: { boost: { value: 1 } },
                      },
                    },
                  ]
                : []),
            ],
            minimumShouldMatch: 0,
          },
        },
      },
      // Ensure that the fields are treated as arrays and count the intersections
      {
        $addFields: {
          searchScore: { $meta: "searchScore" },
          specializationMatchCount: {
            $size: {
              $setIntersection: [
                {
                  $ifNull: [
                    {
                      $cond: [
                        {
                          $isArray: "$skillsAndSpecializations.specializations",
                        },
                        "$skillsAndSpecializations.specializations",
                        [],
                      ],
                    },
                    [],
                  ],
                },
                sanitizedSpecializations,
              ],
            },
          },
          skillMatchCount: {
            $size: {
              $setIntersection: [
                {
                  $ifNull: [
                    {
                      $cond: [
                        { $isArray: "$skillsAndSpecializations.coreSkills" },
                        "$skillsAndSpecializations.coreSkills",
                        [],
                      ],
                    },
                    [],
                  ],
                },
                sanitizedSkills,
              ],
            },
          },
          educationMatchCount: {
            $size: {
              $setIntersection: [
                {
                  $ifNull: [
                    {
                      $cond: [
                        { $isArray: "$personalInformation.educationalLevel" },
                        "$personalInformation.educationalLevel",
                        [],
                      ],
                    },
                    [],
                  ],
                },
                sanitizedEducationalLevels,
              ],
            },
          },
          locationMatchCount: {
            $size: {
              $setIntersection: [
                {
                  $ifNull: [
                    {
                      $cond: [
                        { $isArray: ["$personalInformation.cityMunicipality"] },
                        ["$personalInformation.cityMunicipality"],
                        [],
                      ],
                    },
                    [],
                  ],
                },
                sanitizedLocations,
              ],
            },
          },
        },
      },
      // Adjust the score based on the number of matches
      {
        $addFields: {
          adjustedScore: {
            $add: [
              "$searchScore",
              { $multiply: ["$specializationMatchCount", 2] }, // Each match in specializations adds 2 to the score
              { $multiply: ["$skillMatchCount", 1.5] }, // Each match in skills adds 1.5 to the score
              { $multiply: ["$educationMatchCount", 1] }, // Each match in education adds 1 to the score
              { $multiply: ["$locationMatchCount", 1.5] }, // Each match in location adds 1.5 to the score
            ],
          },
        },
      },
      // Sort by the adjustedScore in descending order
      {
        $sort: { adjustedScore: -1 },
      },
      // Limit to a certain number of candidates, e.g., top 10
      {
        $limit: 10,
      },
      // Project only the fields we want to return
      {
        $project: {
          _id: 1,
          personalInformation: 1,
          skillsAndSpecializations: 1,
          adjustedScore: 1,
          specializationMatchCount: 1,
          skillMatchCount: 1,
          educationMatchCount: 1,
          locationMatchCount: 1,
        },
      },
    ];

    // Execute the aggregation pipeline
    const recommendedCandidates = await JobSeeker.aggregate(pipeline);

    if (recommendedCandidates.length === 0) {
      return res.status(404).json({ message: "No matching candidates found." });
    }

    // Return the candidates along with their adjusted scores
    res.status(200).json({ candidates: recommendedCandidates });
  } catch (error) {
    console.error("Error recommending candidates:", error);
    res.status(500).json({ message: "Failed to recommend candidates." });
  }
};