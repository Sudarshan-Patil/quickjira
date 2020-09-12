export interface searchParams{    
    key: string,
    fields: {            
        customfield_10020: any,
        project: {            
            name: number            
        },
        assignee: {            
            displayName: string           
        },        
        status: {            
            name: string        
        },
        issuetype:{
            name:string
        }
    }
}

export class epicStoriesParam
{
    issues: [
        {                     
            key:string,
            fields: {
                issuetype: {                
                    name:string,                
                },
                customfield_10020: number,
                assignee: {                
                    displayName: string,                    
                },
                priority: {                    
                    name: string   
                },
                status: {                    
                    name:string
                    id:number
                }
            }
        }
    ]  
}

export interface epicDataParam
{ 
    key: any,
    fields: {
        summary:string,
        description:string,
        customfield_10020: number,
        project: {                
            key: string,
            name: string,                
        },
        assignee: {
            displayName: string,
        },
        status: {                
            name: string,
            id: number,
            statusCategory: {                    
                name: string
            }
        }
    }
}

export interface storyDataParam
{ 
    key: any,
    fields: {
        summary:string,
        description:string,
        customfield_10020: number,
        project: {                
            key: string,
            name: string,                
        },
        assignee: {
            displayName: string,
        },
        status: {                
            name: string,
            id: number,
            statusCategory: {                    
                name: string
            }
        },
        subtasks:[]
    }
}