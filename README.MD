TeamZubiDubi:
Raul Contreras: rac326@lehigh.edu
Vrushti Patel: vap326@lehigh.edu
Gabriel Veras: gav326@lehigh.edu
Sanchita Shrivastava: sas626@lehigh.edu

Project Summary:
Our project: SyllyCal, takes user input in the form of a pdf and return a gcal compatible csv file to import details about the course's scheduled (assignment due dates, class times, and assignment time frame).

This program used AWS Bedrock to leverage Amazon's LLM model (specifically Claude 3 - Haiku) to prompt for csv information in the proper format. 

The program is ran locally using the index.html file and maven java program. 

From the base directory write:
- java -jar ./parser.app/target/parser.app-1.0-SNAPSHOT.jar 

  (Note that this requires AWS credentials with access to claude 3 haiku)

Go live from the frontend folder, and the program should run!

