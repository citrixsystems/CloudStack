// Copyright 2012 Citrix Systems, Inc. Licensed under the
// Apache License, Version 2.0 (the "License"); you may not use this
// file except in compliance with the License.  Citrix Systems, Inc.
// reserves all rights not expressly granted by the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 
// Automatically generated by addcopyright.py at 04/03/2012
package com.cloud.api.commands;

import org.apache.log4j.Logger;

import com.cloud.api.ApiConstants;
import com.cloud.api.BaseAsyncCmd;
import com.cloud.api.BaseCmd;
import com.cloud.api.IdentityMapper;
import com.cloud.api.Implementation;
import com.cloud.api.Parameter;
import com.cloud.api.ServerApiException;
import com.cloud.api.response.SuccessResponse;
import com.cloud.async.AsyncJob;
import com.cloud.event.EventTypes;
import com.cloud.network.security.SecurityGroup;
import com.cloud.user.Account;

@Implementation(responseObject = SuccessResponse.class, description = "Deletes a particular egress rule from this security group", since="3.0.0")
public class RevokeSecurityGroupEgressCmd extends BaseAsyncCmd {
    public static final Logger s_logger = Logger.getLogger(RevokeSecurityGroupEgressCmd.class.getName());

    private static final String s_name = "revokesecuritygroupegress";

    // ///////////////////////////////////////////////////
    // ////////////// API parameters /////////////////////
    // ///////////////////////////////////////////////////

    @IdentityMapper(entityTableName="security_group_rule")
    @Parameter(name = ApiConstants.ID, type = CommandType.LONG, required = true, description = "The ID of the egress rule")
    private Long id;

    // ///////////////////////////////////////////////////
    // ///////////////// Accessors ///////////////////////
    // ///////////////////////////////////////////////////

    public Long getId() {
        return id;
    }

    // ///////////////////////////////////////////////////
    // ///////////// API Implementation///////////////////
    // ///////////////////////////////////////////////////

    @Override
    public String getCommandName() {
        return s_name;
    }

    public static String getResultObjectName() {
        return "revokesecuritygroupegress";
    }

    @Override
    public long getEntityOwnerId() {
        SecurityGroup group = _entityMgr.findById(SecurityGroup.class, getId());
        if (group != null) {
            return group.getAccountId();
        }

        return Account.ACCOUNT_ID_SYSTEM; // no account info given, parent this command to SYSTEM so ERROR events are tracked
    }

    @Override
    public String getEventType() {
        return EventTypes.EVENT_SECURITY_GROUP_REVOKE_EGRESS;
    }

    @Override
    public String getEventDescription() {
        return "revoking egress rule id: " + getId();
    }

    @Override
    public void execute() {
        boolean result = _securityGroupService.revokeSecurityGroupEgress(this);
        if (result) {
            SuccessResponse response = new SuccessResponse(getCommandName());
            this.setResponseObject(response);
        } else {
            throw new ServerApiException(BaseCmd.INTERNAL_ERROR, "Failed to revoke security group egress rule");
        }
    }

    @Override
    public AsyncJob.Type getInstanceType() {
        return AsyncJob.Type.SecurityGroup;
    }

    @Override
    public Long getInstanceId() {
        return getId();
    }
}
